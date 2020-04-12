// todo: Integer handling from Neo4j to JS
const {defaultLink} = require( './defaults' );
const {defaultNode} = require( './defaults' );
const {defaultSeq} = require( './defaults' );

const resolvers = {
	Query: {},
	Mutation: {
		async CreateNode( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				CREATE (n:Node:${ args.type } {id: randomUUID(), label: $label, story: $story, type: $type}) 
				RETURN n`;
			const results = await session.run( query, args );
			return {
				success: true,
				node: results.records.map( record => record.get( 'n' ).properties )[0],
			};
		},
		async CreateLink( _, args, ctx ) {
			const session = ctx.driver.session();
			let ret = { success: true, link: defaultLink, from: defaultNode, to: defaultNode, seq: defaultSeq };
			// Create Link node
			// Connect Link with first node
			// Connect Link with second node
			let query = `
			  CREATE (l:Link:${ args.type } {id: randomUUID()})
			  SET l += $props
			  SET l += {from_id: $from_id, to_id: $to_id, type: $type, label: $label}
				WITH l AS l
				MATCH (from:Node) WHERE from.id = $from_id CREATE (from)-[:ACTION]->(l)
				WITH l AS l, from AS from
				MATCH (to:Node) WHERE to.id = $to_id CREATE (l)-[:ON]->(to)
				RETURN l AS link, from, to`;
			let results = await session.run( query, args );
			ret.link = results.records[0].get( 'link' ).properties;
			ret.from = results.records[0].get( 'from' ).properties;
			ret.to = results.records[0].get( 'to' ).properties;

			// if user specified a sequence on a link
			if ( args.sequence ) {
				// todo: does Sequence need an UUID?
				const qargs = { sequence: args.sequence, link_id: ret.link.id };
				// create Sequence node in neo4j and connect it to the Link node
				query = `
					CREATE (s:Sequence {id: randomUUID()})
					SET s += $sequence
					WITH s AS s
					MATCH (l:Link) WHERE l.id = $link_id CREATE (l)-[:IS]->(s)-[:ON]->(l)
					RETURN s AS seq`;
				results = await session.run( query, qargs );
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
			// todo: create one big query?

			const session = ctx.driver.session();
			const qargs = { id: args.id, props: args.props, sequence: args.sequence };
			let ret = { success: true, link: defaultLink, from: defaultNode, to: defaultNode, seq: defaultSeq };
			// only changed data will be sent - because of that I can check for existence in the props object
			// if property exists, it changed

			if ( args.props ) {
				// update all internal node properties
				const query = `
					MATCH (l:Link) WHERE l.id = $id
					SET l += $props
					RETURN l AS link
				`;
				const results = await session.run( query, qargs );
				ret.link = results.records[0].get( 'link' ).properties;
				// did 'to' node change?
				// delete current relation and set new relation
				if ( args.props.to_id ) {
					const query = `
						MATCH (l:Link)-[r:ON]->(:Node) WHERE l.id = $id
						DELETE r
						WITH l AS l
						MATCH (to:Node) WHERE to.id = $props.to_id
						CREATE (l)-[:ON]->(to)
						RETURN to
					`;
					const results = await session.run( query, qargs );
					ret.to = results.records[0].get( 'to' ).properties;
				}
				// did 'from' node change?
				// delete current relation and set new relation
				if ( args.props.from_id ) {
					const query = `
						MATCH (:Node)-[r:ACTION]->(l:Link) WHERE l.id = $id
						DELETE r
						WITH l AS l
						MATCH (from:Node) WHERE from.id = $props.from_id
						CREATE (from)-[:ACTION]->(l)
						RETURN from
					`;
					const results = await session.run( query, qargs );
					ret.from = results.records[0].get( 'from' ).properties;
				}
			}
			// did sequence change? (updated, deleted, created)
			if ( args.sequence ) {

				// if user wants to delete the sequence property
				if ( args.sequence.remove ) {
					const query = `
						MATCH (l:Link)-[:IS]->(s:Sequence) WHERE l.id = $id
						DETACH DELETE s
					`;
					await session.run( query, qargs );
				}
				// if user updated/created the property, check if exists and update if so, otherwise create and set props
				else {
					const query = `
						MATCH (l:Link) WHERE l.id = $id
						MERGE (l)-[:IS]->(s:Sequence)-[:ON]->(l)
						ON CREATE SET s = {id: randomUUID()}, s += $sequence
						ON MATCH SET s += $sequence
						RETURN s AS seq
					`;
					const results = await session.run( query, qargs );
					ret.seq = results.records[0].get( 'seq' ).properties;
				}
			}

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
				success: true
			}
		},
		// delete link
	},
};

module.exports = resolvers;