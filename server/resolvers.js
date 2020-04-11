// todo: Integer handling from Neo4j to JS

const resolvers = {
	Query: {},
	Mutation: {
		async CreateNode( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `
				CREATE (n:Node:${ args.type } {id: randomUUID(), label: $label, story: $story, type: $type}) 
				RETURN n`;
			let results = await session.run( query, args );
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
				let args2 = { sequence: args.sequence, link_id: ret.link.id };
				// create Sequence node in neo4j and connect it to the Link node
				query = `
					CREATE (s:Sequence {id: randomUUID()})
					SET s += $sequence
					WITH s AS s
					MATCH (l:Link) WHERE l.id = $link_id CREATE (l)-[:IS]->(s)-[:ON]->(l)
					RETURN s AS seq`;
				results = await session.run( query, args2 );
				ret.seq = results.records[0].get( 'seq' ).properties;
			}
			return ret;
		},
		async UpdateNode( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `MATCH (n:Node) WHERE n.id = $id SET n += $props RETURN n`;
			let results = await session.run( query, args );
			return {
				success: true,
				node: results.records.map( record => record.get( 'n' ).properties )[0],
			};
		},
		async UpdateLink( _, args, ctx ) {
			// todo: create one big query?
			// todo: test sequence (create, update, delete) - runs, but neo4j returns an error?
			const session = ctx.driver.session();
			let qargs = { id: args.id, props: args.props };
			let ret = { success: true, link: defaultLink, from: defaultNode, to: defaultNode, seq: defaultSeq };
			// only changed data will be sent - because of that I can check for existence in the props object
			// if property exists, it changed

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
				let results = await session.run( query, qargs );
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
				let results = await session.run( query, qargs );
				ret.from = results.records[0].get( 'from' ).properties;
			}
			// did sequence change? (updated, deleted, created)
			if ( args.props.sequence ) {
				// if user wants to delete the sequence property
				if ( args.props.sequence.remove ) {
					const query = `
						MATCH (l:Link)-[:IS]->(s:Sequence) WHERE l.id = $id
						DETACH DELETE s
					`;
					await session.run( query, qargs );
					return {
						success: true
					}
				}
				// if user updated/created the property, check if exists and update if so, otherwise create and set props
				else {
					qargs.sequence = args.props.sequence;
					const query = `
						MATCH (l:Link) WHERE l.id = $id
						MERGE (l)-[:IS]->(s:Sequence)-[:ON]->(l)
						ON CREATE SET s = {id: randomUUID()}, s += $sequence
						ON MATCH SET s += $sequence
						RETURN s AS seq
					`;
					let results = await session.run( query, qargs );
					ret.seq = results.records[0].get( 'seq' ).properties;
				}
			}

			// make sure all internal link props get updated
			const query = `
				MATCH (l:Link) WHERE l.id = $id
				SET l += $props
				RETURN l AS link
			`;
			let results = await session.run( query, qargs );
			ret.link = results.records[0].get( 'link' ).properties;

			return ret;
		},
		// delete node
		// delete link
	},
};

const defaultSeq = { group: 'None', seq: -1, label: 'None' };
const defaultLink = {
	id: '-1',
	label: 'None',
	from_id: '-1',
	to_id: '-1',
	type: 'None',
	story: 'None',
	sequence: defaultSeq,
	optional: false,
	synchronous: false,
	unreliable: false,
};
const defaultNode = {
	id: '-1',
	label: 'None',
	story: 'None',
	type: 'None',
};

module.exports = resolvers;