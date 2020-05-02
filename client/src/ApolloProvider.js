import React from 'react';
import App from './App';
import { createHttpLink } from 'apollo-link-http';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import gql from 'graphql-tag';

const httpLink = createHttpLink( {
	uri: 'http://localhost:8080/graphql',
} );

const cache = new InMemoryCache( {
	dataIdFromObject: ( { id } ) => id,
} );

const client = new ApolloClient( {
	link: httpLink,
	cache,
	resolvers: {
		Mutation: {
			addNode: ( _root, variables, { cache } ) => {
				const { label, props, type } = variables;
				const { story, synchronous, unreliable } = props;

				cache.modify( 'ROOT_QUERY', {
					Nodes( ...args ) {
						// a temporary ID that is only for this session. Ones the user presses
						const newId = args[0].length + 1;
						const newNode = { id: newId, label, type, story, synchronous, unreliable, localNode: true };
						return args[0].concat( [ newNode ] );
					},
				} );
			},
		},
	},
} );

cache.writeQuery( {
	query: gql`
    query {
      activeItem {
        itemId
        itemType
      }
    }
	`,
	data: {
		activeItem: {
			itemId: '',
			itemType: '',
			__typename: 'ActiveItem',
		},
	},
} );

export default (
	<ApolloProvider client={ client }>
		<App/>
	</ApolloProvider>
);
