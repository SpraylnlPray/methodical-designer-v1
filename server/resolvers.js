const resolvers = {
	Query: {},
	Mutation: {
		async CreateNode( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `CREATE (n:Node:${ args.type } 
				{id: randomUUID(), label: $label, story: $story, type: $type}) 
				RETURN n`;
			let results = await session.run( query, args );
			return results.records.map( record => record.get( 'n' ).properties )[0];
		},
		async CreateLink( _, args, ctx ) {
			const session = ctx.driver.session();
			// Create Link node
			// Connect Link with first node
			// Connect Link with second node
			let query = `
			  CREATE (l:Link:${ args.type } {id: randomUUID()})
			  SET l += $props
			  SET l += {from_id: $from_id, to_id: $to_id, type: $type, label: $label}
				WITH l as l
				MATCH (from:Node) WHERE from.id = $from_id CREATE (from)-[:ACTION]->(l)
				WITH l as l, from as from
				MATCH (to:Node) WHERE to.id = $to_id CREATE (l)-[:ON]->(to)
				RETURN l as link, from, to`;
			let results = await session.run( query, args );
			let link = results.records[0].get( 'link' ).properties;
			let from = results.records[0].get( 'from' ).properties;
			let to = results.records[0].get( 'to' ).properties;
			let ret = { link, from, to, seq: {} };

			// if user specified a sequence on a link
			if ( args.sequence ) {
				let args2 = { sequence: args.sequence, link_id: link.id };
				// create Sequence node in neo4j and connect it to the Link node
				query = `
					CREATE (s:Sequence {id: randomUUID()})
					SET s += $sequence
					WITH s as s
					MATCH (l:Link) WHERE l.id = $link_id CREATE (l)-[:IS]->(s) CREATE (s)-[:ON]->(l)
					RETURN s as seq`;
				results = await session.run( query, args2 );
				ret.seq = results.records[0].get( 'seq' ).properties;
			}
			return ret;
		},
		async UpdateNode( _, args, ctx ) {
			const session = ctx.driver.session();
			const query = `MATCH (n:Node) WHERE n.id = $id SET n += $props RETURN n`;
			let results = await session.run( query, args );
			return results.records.map( record => record.get( 'n' ).properties )[0];
		},
		async UpdateLink( _, args, ctx ) {
			// todo: maybe just on qargs arg for the whole scope?
			const session = ctx.driver.session();
			// only changed data will be sent - because of that I can check for existence in the props object
			// if exists -> changed

			// did "to" node change?
			// delete current relation and set new relation
			if ( args.props.to_id ) {
				const qargs = { id: args.id, props: args.props };
				const query = `
					MATCH (l:Link)-[r:ON]->(:Node) WHERE l.id = $id
					DELETE r
					WITH l AS l
					MATCH (to:Node) WHERE to.id = $props.to_id
					CREATE (l)-[:ON]->(to)
					RETURN l as link, to
				`;
				let results = await session.run( query, qargs );
			}
			// did "from" node change?
			// delete current relation and set new relation
			if ( args.props.from_id ) {
				const qargs = { id: args.id, props: args.props };
				const query = `
					MATCH (:Node)-[r:ACTION]->(l:Link) WHERE l.id = $id
					DELETE r
					WITH l AS l
					MATCH (from:Node) WHERE from.id = $props.from_id
					CREATE (from)-[:ACTION]->(l)
					RETURN l as link, from
				`;
				let results = await session.run( query, qargs );
			}
			// did sequence change? (updated, deleted, created)

			// make sure all internal link props get updated
			const qargs = { id: args.id, props: args.props };
			const query = `
				MATCH (l:Link) WHERE l.id = $id
				SET l += $props
				RETURN l as link
			`;
			let results = await session.run( query, qargs );
		},
		// delete node
		// delete link
	},
};

module.exports = resolvers;