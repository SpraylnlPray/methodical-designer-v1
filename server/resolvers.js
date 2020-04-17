const seedQuery = require( './seed' );
const neo4j = require( 'neo4j-driver' );
const { defaultNode } = require( './defaults' );
// todo: add try catch
const defaultRes = { success: true, message: '' };

const resolvers = {
	Mutation: {
		async SeedDB( _, __, ctx ) {
			const session = ctx.driver.session();
			const deleteQuery = `
				MATCH (n) DETACH DELETE n
			`;
			await session.run( deleteQuery );
			await session.run( seedQuery );
			return {
				success: true,
			};
		},

		async CreateNode( _, args, ctx ) {
			try {
				const session = ctx.driver.session();
				const query = `
				CREATE (n:Node:${ args.type } {id: randomUUID(), label: $label, type: $type})
				SET n += $props
				RETURN n`;
				const results = await session.run( query, args );
				return {
					...defaultRes,
					node: PrepareReturn( results, 'n', defaultNode ),
				};
			}
			catch ( e ) {
				return {
					message: e.message,
					success: false,
				};
			}

		},
		async CreateLink( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				CREATE (l:Link:${ args.type } {id: randomUUID()})
				SET l += {x_id: $x_id, y_id: $y_id, type: $type, label: $label}
				WITH l AS l
				MATCH (x:Node) WHERE x.id = $x_id
				CREATE (l)-[:X_NODE]->(x)
				WITH l AS l, x AS x
				MATCH (y:Node) WHERE y.id = $y_id
				CREATE (l)-[:Y_NODE]->(y)
				RETURN l
			`;
			const results = await session.run( query, args );
			return {
				success: true,
				link: Get( results, 'l' ),
			};
		},
		async CreateSequence( _, args, ctx ) {
			args.props.seq = neo4j.int( args.props.seq );
			const session = ctx.driver.session();
			const query = `
				CREATE (s:Sequence {id: randomUUID()})
				SET s += $props
				WITH s AS s
				MATCH (l:Link) WHERE l.id = $link_id
				CREATE (l)-[:IS]->(s)
				RETURN s, l
			`;
			const results = await session.run( query, args );
			const seq = Get( results, 's' );
			seq.seq = neo4j.integer.toNumber( seq.seq );
			return {
				success: true,
				seq,
				link: Get( results, 'l' ),
			};
		},
		async CreateLinkEnd( _, args, ctx ) {
			const session = ctx.driver.session();
			args = TakeKeysFromProps( args, 'xy' );
			const query = `
				CREATE (le:LinkEnd {id: randomUUID()})
				SET le += $props
				WITH le AS le
				MATCH (l:Link) WHERE l.id = $link_id
				CREATE (l)-[:${ args.xy.toUpperCase() }_END]->(le)
				RETURN le, l
			`;
			const results = await session.run( query, args );
			return {
				success: true,
				link: Get( results, 'l' ),
				end: Get( results, 'le' ),
			};
		},

		async UpdateNode( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				MATCH (n:Node) WHERE n.id = $id
				SET n += $props
				RETURN n
			`;
			const results = await session.run( query, args );
			return {
				success: true,
				node: Get( results, 'n' ),
			};
		},
		async UpdateLink( _, args, ctx ) {
			const session = ctx.driver.session();
			let query = `
				MATCH (l:Link) WHERE l.id = $id
				SET l += $props
			`;

			if ( args.props.x_id ) {
				query += `
					WITH l AS l
					OPTIONAL MATCH (l)-[r:X_NODE]->(:Node)
					DELETE r
					WITH l AS l
					MATCH (n:Node) WHERE n.id = $props.x_id
					CREATE (l)-[r:X_NODE]->(n)
				`;
			}
			if ( args.props.y_id ) {
				query += `
					WITH l AS l
					OPTIONAL MATCH (l)-[r:Y_NODE]->(:Node)
					DELETE r
					WITH l AS l
					MATCH (n:Node) WHERE n.id = $props.y_id
					CREATE (l)-[r:Y_NODE]->(n)
				`;
			}
			query += `
				RETURN l
			`;
			const results = await session.run( query, args );

			return {
				success: true,
				link: Get( results, 'l' ),
			};
		},
		async UpdateSequence( _, args, ctx ) {
			const session = ctx.driver.session();
			args.props.seq = neo4j.int( args.props.seq );
			const query = `
				MATCH (l:Link) WHERE l.id = $link_id
				MATCH (l)-[:IS]->(s:Sequence)
				SET s += $props
				RETURN l, s
			`;
			const results = await session.run( query, args );
			const seq = Get( results, 's' );
			seq.seq = neo4j.integer.toNumber( seq.seq );
			return {
				success: true,
				link: Get( results, 'l' ),
				seq,
			};
		},
		async UpdateLinkEnd( _, args, ctx ) {
			const session = ctx.driver.session();
			args = TakeKeysFromProps( args, 'xy' );
			const query = `
				MATCH (l:Link) WHERE l.id = $link_id
				MATCH (l)-[:${ args.xy.toUpperCase() }_END]->(le:LinkEnd)
				SET le += $props
				RETURN le, l
			`;
			const results = await session.run( query, args );
			return {
				success: true,
				link: Get( results, 'l' ),
				end: Get( results, 'le' ),
			};
		},

		async DeleteNode( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				MATCH (n:Node) WHERE n.id = $id
				OPTIONAL MATCH (n)-[:X_NODE]-(l:Link)
				SET l.x_id = ""
				WITH n AS n
				OPTIONAL MATCH (n)-[:Y_NODE]-(l:Link)
				SET l.y_id = ""
				DETACH DELETE n
			`;
			await session.run( query, args );
			return { success: true };
		},
		async DeleteLink( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				MATCH (l:Link) WHERE l.id = $id
				OPTIONAL MATCH (l)--(le:LinkEnd)
				DETACH DELETE le
				WITH l AS l
				OPTIONAL MATCH (l)--(s:Sequence)
				DETACH DELETE s
				DETACH DELETE l
			`;
			await session.run( query, args );
			return { success: true };
		},
		async DeleteSequence( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				MATCH (l:Link) WHERE l.id = $link_id
				MATCH (l)-[:IS]->(s:Sequence)
				DETACH DELETE s
			`;
			await session.run( query, args );
			return { success: true };
		},
		async DeleteLinkEnd( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				MATCH (l:Link) WHERE l.id = $link_id
				MATCH (l)-[:${ args.xy.toUpperCase() }_END]->(le:LinkEnd)
				DETACH DELETE le
			`;
			await session.run( query, args );
			return { success: true };
		},
	},
};

// takes objects out of props on to args so we can pass args directly
function TakeKeysFromProps( object, ...keys ) {
	const props = object.props;
	for ( let key of keys ) {
		if ( props[key] ) {
			object[key] = props[key];
			delete object.props[key];
		}
	}
	return object;
}

// Get a key from the return object
function Get( results, key ) {
	if ( results.records[0].keys.includes( key ) ) {
		return results.records[0].get( key ).properties;
	}
	return undefined;
}

// Sets undefined properties to default values
function SetDefaults( obj, defaultObj ) {
	for ( let key of Object.keys( defaultObj ) ) {
		if ( !obj[key] ) {
			obj[key] = defaultObj[key];
		}
	}
	return obj;
}

function PrepareReturn( results, key, defaultObj ) {
	let obj = Get( results, key );
	obj = SetDefaults( obj, defaultObj );
	return obj;
}

module.exports = resolvers;