// todo: Integer handling from Neo4j to JS
// todo: find solution for "resolve function for XY returned undefined"
const { defaultLink, defaultLinkEnd } = require( './defaults' );
const seedQuery = require( './seed' );

const resolvers = {
	Query: {
		async LinkById( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				MATCH (l:Link) WHERE l.id = $id
				RETURN l
			`;
			const results = await session.run( query, args );
			return results.records[0].get( 'l' ).properties;
		},
		async NodeById( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				MATCH (n:Node) WHERE n.id = $id
				RETURN n
			`;
			const results = await session.run( query, args );
			return results.records[0].get( 'n' ).properties;
		},
	},
	Link: {
		x: async( parent, _, ctx ) => {
			const session = ctx.driver.session();
			const query = `
				MATCH (l:Link) WHERE l.id = $id
				MATCH (l)-[:X_NODE]->(n:Node)
				RETURN n
			`;
			const results = await session.run( query, parent );
			return results.records[0].get( 'n' ).properties;
		},
		y: async( parent, _, ctx ) => {
			const session = ctx.driver.session();
			const query = `
				MATCH (l:Link) WHERE l.id = $id
				MATCH (l)-[:Y_NODE]->(n:Node)
				RETURN n
			`;
			const results = await session.run( query, parent );
			return results.records[0].get( 'n' ).properties;
		},
		x_end: async( parent, _, ctx ) => {
			const session = ctx.driver.session();
			const query = `
				MATCH (l:Link) WHERE l.id = $id
				MATCH (l)-[:X_END]->(le:LinkEnd)
				RETURN le
			`;
			const results = await session.run( query, parent );
			return results.records[0].get( 'le' ).properties;
		},
		y_end: async( parent, _, ctx ) => {
			const session = ctx.driver.session();
			const query = `
				MATCH (l:Link) WHERE l.id = $id
				MATCH (l)-[:Y_END]->(le:LinkEnd)
				RETURN le
			`;
			const results = await session.run( query, parent );
			return results.records[0].get( 'le' ).properties;
		},
		sequence: async( parent, _, ctx ) => {
			const session = ctx.driver.session();
			const query = `
				MATCH (l:Link) WHERE l.id = $id
				MATCH (l)-[:IS]->(s:Sequence)
				RETURN s
			`;
			const results = await session.run( query, parent );
			return results.records[0].get( 's' ).properties;
		},
	},
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
			const session = ctx.driver.session();
			const query = `
				CREATE (n:Node:${ args.type } {id: randomUUID(), label: $label, type: $type})
				SET n += $props
				RETURN n`;
			const results = await session.run( query, args );
			return {
				success: true,
				node: results.records.map( record => record.get( 'n' ).properties )[0],
			};
		},
		async CreateLink( _, args, ctx ) {
			const session = ctx.driver.session();
			let ret = { success: true };
			const query = `
				CREATE (l:Link:${ args.type } {id: randomUUID()})
				SET l += {x_id: $x_id, y_id: $y_id, type: $type, label: $label}
				WITH l AS l
				MATCH (x:Node) WHERE x.id = $x_id
				CREATE (l)-[:X_NODE]->(x)
				WITH l AS l, x AS x
				MATCH (y:Node) WHERE y.id = $y_id
				CREATE (l)-[:Y_NODE]->(y)
				RETURN l AS link
			`;
			const results = await session.run( query, args );
			ret = AssignSafely( ret, results.records[0], 'link' );
			return ret;
		},
		async CreateSequence( _, args, ctx ) {
			const session = ctx.driver.session();
			let ret = { success: true };
			const query = `
				CREATE (s:Sequence {id: randomUUID()})
				SET s += $props
				WITH s AS s
				MATCH (l:Link) WHERE l.id = $link_id
				CREATE (l)-[:IS]->(s)
				RETURN s AS seq, l AS link
			`;
			const results = await session.run( query, args );
			ret = AssignSafely( ret, results.records[0], 'seq', 'link' );
			return ret;
		},
		async CreateLinkEnd( _, args, ctx ) {
			const session = ctx.driver.session();
			args = TakeKeysFromProps( args, 'xy' );
			let ret = { success: true };
			const query = `
				CREATE (le:LinkEnd {id: randomUUID()})
				SET le += $props
				WITH le AS le
				MATCH (l:Link) WHERE l.id = $link_id
				CREATE (l)-[:${ args.xy.toUpperCase() }_END]->(le)
				RETURN le AS end, l AS link
			`;
			const results = await session.run( query, args );
			ret = AssignSafely( ret, results.records[0], 'end', 'link' );
			return ret;
		},

		async UpdateNode( _, args, ctx ) {
			let ret = { success: true };
			const session = ctx.driver.session();
			const query = `
				MATCH (n:Node) WHERE n.id = $id
				SET n += $props
				RETURN n as node
			`;
			const results = await session.run( query, args );
			ret = AssignSafely( ret, results.records[0], 'node' );
			return ret;
		},
		async UpdateLink( _, args, ctx ) {
			const session = ctx.driver.session();
			let ret = { success: true };
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
				RETURN l as link
			`;
			const results = await session.run( query, args );

			ret = AssignSafely( ret, results.records[0], 'link' );
			return ret;
		},
		async UpdateSequence( _, args, ctx ) {
			const session = ctx.driver.session();
			let ret = { success: true };
			const query = `
				MATCH (l:Link) WHERE l.id = $link_id
				MATCH (l)-[:IS]->(s:Sequence)
				SET s += $props
				RETURN l AS link, s AS seq
			`;
			const results = await session.run( query, args );
			ret = AssignSafely( ret, results.records[0], 'link', 'seq' );
			return ret;
		},
		async UpdateLinkEnd( _, args, ctx ) {
			const session = ctx.driver.session();
			args = TakeKeysFromProps( args, 'xy' );
			let ret = { success: true, link: defaultLink, end: defaultLinkEnd };
			const query = `
				MATCH (l:Link) WHERE l.id = $link_id
				MATCH (l)-[:${ args.xy.toUpperCase() }_END]->(le:LinkEnd)
				SET le += $props
				RETURN le as end, l as link
			`;
			const results = await session.run( query, args );
			ret = AssignSafely( ret, results.records[0], 'end', 'link' );
			return ret;
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

// checks if a key was returned from the query, if so, it assigns it to the ret object
function AssignSafely( ret, record, ...keys ) {
	for ( let key of keys ) {
		if ( record.keys.includes( key ) ) {
			ret[key] = record.get( key ).properties;
		}
	}
	return ret;
}

module.exports = resolvers;