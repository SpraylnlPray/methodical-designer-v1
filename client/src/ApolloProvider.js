import React from 'react';
import App from './App';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { ApolloProvider } from '@apollo/react-hooks';
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
} );

cache.writeQuery( {
	query: gql`
    query {
      activeItem
    }
	`,
	data: {
		activeItem: '',
	},
} );

export default (
	<ApolloProvider client={ client }>
		<App/>
	</ApolloProvider>
);
