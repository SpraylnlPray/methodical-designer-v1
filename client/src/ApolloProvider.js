import React from 'react';
import App from './App';
import { createHttpLink } from 'apollo-link-http';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import gql from 'graphql-tag';
import { generateLocalUUID } from './utils';

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
						// a temporary ID that is only for this session. Ones the user presses "save to DB" it is replaced with
						// an ID from Neo4j
						const newId = generateLocalUUID();
						const newNode = { id: newId, label, type, story, synchronous, unreliable, localNode: true };
						return args[0].concat( [ newNode ] );
					},
				} );
			},
			addLink: ( _root, variables, { cache } ) => {
				const { label, type, x_id, y_id, props, seq, x_end, y_end } = variables;
				const { optional, story } = props;
				const x = { id: x_id };
				const y = { id: y_id };

				cache.modify( 'ROOT_QUERY', {
					Links( ...args ) {
						const newId = generateLocalUUID();
						const newLink = { id: newId, label, type, x, y, optional, story, x_end, y_end, sequence: seq };
						return args[0].concat( [ newLink ] );
					},
				} );
			},

			updateNode: ( _root, variables, { cache } ) => {
				const { id, props } = variables;
				const { label, story, type, synchronous, unreliable } = props;
				cache.modify( id, {
					label() {
						return label;
					},
					story() {
						return story;
					},
					type() {
						return type;
					},
					synchronous() {
						return synchronous;
					},
					unreliable() {
						return unreliable;
					},
				} );
			},
			updateLink: ( _root, variables, { cache } ) => {
				const { id, props, seq, x_end, y_end } = variables;
				const { label, type, x_id, y_id, optional, story } = props;
				const x = { id: x_id };
				const y = { id: y_id };

				cache.modify( id, {
					label() {
						return label;
					},
					type() {
						return type;
					},
					seq() {
						return seq;
					},
					x() {
						return x;
					},
					y() {
						return y;
					},
					x_end() {
						return x_end;
					},
					y_end() {
						return y_end;
					},
					optional() {
						return optional;
					},
					story() {
						return story;
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
