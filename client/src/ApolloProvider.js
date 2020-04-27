import React from 'react';
import App from './App';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { ApolloProvider } from '@apollo/react-hooks';

const httpLink = createHttpLink( {
	uri: 'http://localhost:8080/graphql',
} );

const cache = new InMemoryCache( {
	dataIdFromObject: ( { id } ) => id,
} );

const client = new ApolloClient( {
	link: httpLink,
	cache,
} );

cache.writeData( {
	data: {
		activeItem: {
			id: '',
			type: '',
			__typename: 'ActiveItem',
		},
	},
} );

export default (
	<ApolloProvider client={ client }>
		<App/>
	</ApolloProvider>
);
