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
			const query = `
			  CREATE (l:Link:${ args.type } {id: randomUUID()})
			  SET l += $props
			  SET l += {from_id: $from_id, to_id: $to_id, type: $type, label: $label}			  
				WITH l as l
				MATCH (from:Node) WHERE from.id = $from_id CREATE (from)-[:ACTION]->(l)
				WITH l as l
				MATCH (to:Node) WHERE to.id = $to_id CREATE (l)-[:ON]->(to)
				RETURN l`;
			let results = await session.run( query, args );
			return results.records.map( record => record.get( 'l' ).properties )[0];
		},
		async UpdateNode( _, args, ctx ) {
			const session = ctx.driver.session();
			console.log( args );
			const query = `MATCH (n:Node) WHERE n.id = $id SET n += $props RETURN n`;
			let results = await session.run( query, args );
			return results.records.map( record => record.get( 'n' ).properties )[0];
		},
		// update link
		// delete node
		// delete link
	},
};

module.exports = resolvers;