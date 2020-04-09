const fs = require( 'fs' );
const path = require( 'path' );
const scalars = './schemas/scalars.graphql';
const interfaces = './schemas/interfaces.graphql';
const enums = './schemas/enums.graphql';
const types = './schemas/types.graphql';
const queries = './schemas/queries.graphql';
const mutations = './schemas/mutations.graphql';
const encoding = 'utf-8';
const {
				GRAPHQL_SCALARS, GRAPHQL_INTERFACES, GRAPHQL_ENUMS, GRAPHQL_TYPES,
				GRAPHQL_QUERIES, GRAPHQL_MUTATIONS,
			} = process.env;

let typeDefs = '';
typeDefs += fs.readFileSync( GRAPHQL_SCALARS || path.join( __dirname, scalars ) )
	.toString( encoding );

typeDefs += fs.readFileSync( GRAPHQL_INTERFACES || path.join( __dirname, interfaces ) )
	.toString( encoding );

typeDefs += fs.readFileSync( GRAPHQL_ENUMS || path.join( __dirname, enums ) )
	.toString( encoding );

typeDefs += fs.readFileSync( GRAPHQL_TYPES || path.join( __dirname, types ) )
	.toString( encoding );

typeDefs += fs.readFileSync( GRAPHQL_QUERIES || path.join( __dirname, queries ) )
	.toString( encoding );

typeDefs += fs.readFileSync( GRAPHQL_MUTATIONS || path.join( __dirname, mutations ) )
	.toString( encoding );

module.exports = typeDefs;