import React from 'react';
import App from './App';
import { createHttpLink } from 'apollo-link-http';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import gql from 'graphql-tag';
import { generateLocalUUID } from './utils';
import { DELETED_NODE_IDS, LOCAL_LINKS, LOCAL_NODES } from './queries/LocalQueries';

const httpLink = createHttpLink( {
	uri: 'http://localhost:8080/graphql',
} );

const cache = new InMemoryCache( {
	dataIdFromObject: ( { id } ) => id,
	typePolicies: {
		Query: {
			fields: {
				Node( existingData, { args, toReference } ) {
					console.log( 'hello from Node' );
					return existingData;
				},
				Nodes( existingData, { args, toReference } ) {
					console.log( 'hello from Nodes' );
					return existingData;
				},
			},
		},
	},
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

			deleteNode: ( _root, variables, { cache } ) => {
				const { Nodes } = cache.readQuery( { query: LOCAL_NODES } );
				const { deletedNodes } = cache.readQuery( { query: DELETED_NODE_IDS } );
				const { Links } = cache.readQuery( { query: LOCAL_LINKS } );

				let nodesCopy = Nodes.concat();
				let nodeToDelete = nodesCopy.find( node => node.id === variables.id );
				nodesCopy = nodesCopy.filter( node => node.id !== variables.id );
				let linksCopy = JSON.parse( JSON.stringify( Links ) );

				// todo: handling for when both nodes are same and this node gets deleted
				linksCopy = linksCopy.map( link => {
					if ( link.x.id === nodeToDelete.id ) {
						link.x.id = link.y.id;
					}
					else if ( link.y.id === nodeToDelete.id ) {
						link.y.id = link.x.id;
					}
					return link;
				} );

				cache.writeQuery( {
					query: LOCAL_NODES,
					data: { Nodes: nodesCopy },
				} );

				cache.writeQuery( {
					query: LOCAL_LINKS,
					data: { Links: linksCopy },
				} );

				cache.writeQuery( {
					query: DELETED_NODE_IDS,
					data: {
						deletedNodes: deletedNodes.concat( nodeToDelete ),
					},
				} );
			},
		},
	},
} );

cache.writeQuery( {
	query: gql`
    query {
      deletedNodes
      deletedLinks
      activeItem {
        itemId
        itemType
      }
    }
	`,
	data: {
		deletedNodes: [],
		deletedLinks: [],
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
