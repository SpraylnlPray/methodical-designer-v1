// todo: Integer handling from Neo4j to JS
// todo: Update update Link for handling link ends
// todo: node return default values
const { defaultLink, defaultNode, defaultSeq, defaultLinkEnd } = require( './defaults' );
const seedQuery = require( './seed' );

const resolvers = {
	Query: {},
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
			let ret = {
				success: true,
				l: defaultLink,
				x: defaultNode,
				y: defaultNode,
				seq: defaultSeq,
				y_end: defaultLinkEnd,
				x_end: defaultLinkEnd,
			};
			args = TakeKeysFromProps( args, 'x_end', 'y_end', 'sequence' );
			// Create Link node
			let query = `
				CREATE (l:Link:${ args.type } {id: randomUUID()})
				SET l += $props
				SET l += {x_id: $x_id, y_id: $y_id, type: $type, label: $label}
			`;
			if ( args.x_end && args.y_end ) {
				// if user specified a linkend for both, create the nodes in the DB and connect them with the link
				// and the nodes the link is connected to
				query += `
					WITH l AS l
					CREATE (x_end:LinkEnd {id: randomUUID()})
					SET x_end += $x_end
					WITH l AS l, x_end AS x_end
					MATCH (x:Node) WHERE x.id = $x_id CREATE (l)-[:END]->(x_end)-[:TO]->(x)
					WITH l AS l, x_end AS x_end, x AS x
					CREATE (y_end:LinkEnd {id: randomUUID()})
					SET y_end += $y_end
					WITH l AS l, y_end AS y_end, x_end AS x_end, x AS x
					MATCH (y:Node) WHERE y.id = $y_id CREATE (l)-[:END]->(y_end)-[:TO]->(y)
					RETURN x, x_end, l AS link, y_end, y
				`;
			}
			else if ( args.x_end ) {
				// if just the x_end was specified, create the end, connect the link with the end and the end with the x node
				// and the link with the y node
				query += `
					WITH l AS l
					CREATE (x_end:LinkEnd {id: randomUUID()})
					SET x_end += $x_end
					WITH l AS l, x_end AS x_end
					MATCH (x:Node) WHERE x.id = $x_id CREATE (l)-[:END]->(x_end)-[:TO]->(x)
					WITH l AS l, x_end AS x_end, x AS x
					MATCH (y:Node) WHERE y.id = $y_id CREATE (l)-[:TO]->(y)
					RETURN x, x_end, l AS link, y
				`;
			}
			else if ( args.y_end ) {
				// if just the y_end was specified, create the end, connect the link with the end and the end with the y node
				// and the link with the x node
				query += `
					WITH l AS l
					CREATE (y_end:LinkEnd {id: randomUUID()})
					SET y_end += $y_end
					WITH l AS l, y_end AS y_end
					MATCH (y:Node) WHERE y.id = $y_id CREATE (l)-[:END]->(y_end)-[:TO]->(y)
					WITH l AS l, y_end AS y_end, y AS y
					MATCH (x:Node) WHERE x.id = $x_id CREATE (l)-[:TO]->(x)
					RETURN y, y_end, l AS link, x
				`;
			}
			else {
				// if there are no ends specified then just create the link node and connect it to the connected nodes
				query += `
					WITH l AS l
					MATCH (x:Node) WHERE x.id = $x_id CREATE (x)-[:LINK]->(l)
					WITH l AS l, x AS x
					MATCH (y:Node) WHERE y.id = $y_id CREATE (l)-[:TO]->(y)
					RETURN x, l AS link, y
				`;
			}

			let results = await session.run( query, args );
			ret = AssignSafely( ret, results.records[0], 'x', 'x_end', 'link', 'y_end', 'y' );
			// if user specified a sequence on a link
			if ( args.sequence ) {
				args = { sequence: args.sequence, link_id: ret.link.id };
				// create Sequence node in neo4j and connect it to the Link node
				query = `
					CREATE (s:Sequence {id: randomUUID()})
					SET s += $sequence
					WITH s AS s
					MATCH (l:Link) WHERE l.id = $link_id CREATE (l)-[:IS]->(s)-[:ON]->(l)
					RETURN s AS seq`;
				results = await session.run( query, args );
				ret.seq = results.records[0].get( 'seq' ).properties;
			}
			return ret;
		},
		async UpdateNode( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `MATCH (n:Node) WHERE n.id = $id SET n += $props RETURN n`;
			const results = await session.run( query, args );
			return {
				success: true,
				node: results.records.map( record => record.get( 'n' ).properties )[0],
			};
		},
		async UpdateLink( _, args, ctx ) {
			// only changed data will be sent - because of that I can check for existence in the props object
			// if property exists, it changed
			// todo: create one big query?
			const session = ctx.driver.session();
			let ret = { success: true, link: defaultLink, x: defaultNode, y: defaultNode, seq: defaultSeq };
			args = TakeKeysFromProps( args, 'x_id', 'x_end', 'y_end', 'y_id' );

			// user changed x node
			if ( args.x_id ) {
				// there's a link end specified
				if ( args.x_end ) {
					let query = `
						MATCH (l:Link) WHERE l.id = $id
						MATCH (old_x:Node) WHERE old_x.id = l.x_id
						MATCH (l)-[r1:END]-(le:LinkEnd)-[r2:TO]-(old_x)
						DELETE r2 
						WITH l AS l, old_x AS old_x, le AS le
						MATCH (x:Node) WHERE x.id = $x_id
						CREATE (le)-[:TO]->(x)
						RETURN x
					`;
					const results = await session.run( query, args );
					console.log( results.records[0] );
					ret = AssignSafely( ret, results.records[0], 'link', 'x' );

					return ret;
				}
				else {
					let query = `
						MATCH (l:Link) WHERE l.id = $id
						MATCH (old_x:Node) WHERE old_x.id = l.x_id
						MATCH (l)-[r1:TO]->(old_x)
						DELETE r1
						WITH l AS l, old_x AS old_x
						MATCH (x:Node) WHERE x.id = $x_id
						CREATE (l)-[:TO]->(x)
						RETURN x
					`;
					const results = await session.run( query, args );
					ret = AssignSafely( ret, results.records[0], 'link', 'x' );

					return ret;
				}
			}
			// user changed y node
			if ( args.y_id ) {
				if ( args.y_end ) {
					let query = `
						MATCH (l:Link) WHERE l.id = $id
						MATCH (old_y:Node) WHERE old_y.id = l.y_id
						MATCH (l)-[r1:END]-(le:LinkEnd)-[r2:TO]-(old_y)
						DELETE r2 
						WITH l AS l, old_y AS old_y, le AS le
						MATCH (y:Node) WHERE y.id = $y_id
						CREATE (le)-[:TO]->(x)
						RETURN y
					`;
					const results = await session.run( query, args );
					ret = AssignSafely( ret, results.records[0], 'y' );
				}
				else {
					let query = `
						MATCH (l:Link) WHERE l.id = $id
						MATCH (old_y:Node) WHERE old_y.id = l.y_id
						MATCH (l)-[r1:TO]->(old_y)
						DELETE r1
						WITH l AS l, old_y AS old_y
						MATCH (y:Node) WHERE y.id = $y_id
						CREATE (l)-[:TO]->(y)
						RETURN y
					`;
					const results = await session.run( query, args );
					ret = AssignSafely( ret, results.records[0], 'y' );
				}
			}

			let query = `
				MATCH (l:Link) WHERE l.id = $id
				SET l += $props
				RETURN l as link
			`;
			const results = await session.run( query, args );
			ret = AssignSafely( ret, results.records[0], 'link' );

			// if ( args.props ) {
			// 	const query = `
			// 		MATCH (l:Link) WHERE l.id = $id
			// 		SET l += $props
			// 		RETURN l AS link
			// 	`;
			// 	const results = await session.run( query, qargs );
			// 	ret.link = results.records[0].get( 'link' ).properties;
			// 	// did 'to' node change?
			// 	// delete current relation and set new relation
			// 	if ( args.props.y ) {
			// 		const query = `
			// 			MATCH (l:Link)-[r:ON]->(:Node) WHERE l.id = $id
			// 			DELETE r
			// 			WITH l AS l
			// 			MATCH (y:Node) WHERE y.id = $props.y_id
			// 			CREATE (l)-[:ON]->(y)
			// 			RETURN y
			// 		`;
			// 		const results = await session.run( query, qargs );
			// 		ret.to = results.records[0].get( 'x' ).properties;
			// 	}
			// 	// did 'from' node change?
			// 	// delete current relation and set new relation
			// 	if ( args.props.x_id ) {
			// 		const query = `
			// 			MATCH (:Node)-[r:ACTION]->(l:Link) WHERE l.id = $id
			// 			DELETE r
			// 			WITH l AS l
			// 			MATCH (x:Node) WHERE x.id = $props.x_id
			// 			CREATE (x)-[:ACTION]->(l)
			// 			RETURN x
			// 		`;
			// 		const results = await session.run( query, qargs );
			// 		ret.from = results.records[0].get( 'x' ).properties;
			// 	}
			// }
			// // did sequence change? (updated, deleted, created)
			// if ( args.sequence ) {
			// 	// if user wants to delete the sequence property
			// 	if ( args.sequence.remove ) {
			// 		const query = `
			// 			MATCH (l:Link)-[:IS]->(s:Sequence) WHERE l.id = $id
			// 			DETACH DELETE s
			// 		`;
			// 		await session.run( query, qargs );
			// 	}
			// 	// if user updated/created the property, check if exists and update if so, otherwise create and set props
			// 	else {
			// 		const query = `
			// 			MATCH (l:Link) WHERE l.id = $id
			// 			MERGE (l)-[:IS]->(s:Sequence)-[:ON]->(l)
			// 			ON CREATE SET s = {id: randomUUID()}, s += $sequence
			// 			ON MATCH SET s += $sequence
			// 			RETURN s AS seq
			// 		`;
			// 		const results = await session.run( query, qargs );
			// 		ret.seq = results.records[0].get( 'seq' ).properties;
			// 	}
			// }

			return ret;
		},
		async DeleteNode( _, args, ctx ) {
			const session = ctx.driver.session();
			// find all links associated with node
			// find sequence that might be on a link
			// delete sequence
			// delete the link
			// delete node
			const query = `
				MATCH (n:Node {id: $id})
				MATCH (n)--(l:Link)
				OPTIONAL MATCH (l)--(s:Sequence)
				DETACH DELETE s
				DETACH DELETE l
				DELETE n
			`;
			await session.run( query, args );
			return {
				success: true,
			};
		},
		async DeleteLink( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				MATCH (l:Link {id: $id})
				OPTIONAL MATCH (l)--(s:Sequence)
				DETACH DELETE s
				DETACH DELETE l
			`;
			await session.run( query, args );
			return {
				success: true,
			};
		},
	},
};

// takes sub objects out of props on to args so we can pass args directly
function TakeKeysFromProps( object, ...keys ) {
	const props = object.props;
	for ( let key of keys ) {
		if ( props[key] ) {
			object[key] = props[key];
			delete props[key];
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