import React from 'react';
import App from './App';
import { createHttpLink } from 'apollo-link-http';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import gql from 'graphql-tag';
import { generateLocalUUID } from './utils';
import { DELETED_LINKS, DELETED_NODES, LOCAL_LINKS, LOCAL_NODES, LOCAL_NODES_TAG } from './queries/LocalQueries';

const httpLink = createHttpLink( {
	uri: 'http://localhost:8080/graphql',
} );

const cache = new InMemoryCache( {
	dataIdFromObject: ( { id } ) => id,
	typePolicies: {
		Query: {
			fields: {
				Nodes( existingData, { args, toReference } ) {
					return existingData;
				},
			},
		},
		Node: {
			fields: {
				localNode( existingData ) {
					return existingData || false;
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
				const { Nodes } = cache.readQuery( { query: LOCAL_NODES } );

				const newId = generateLocalUUID();
				const newNode = { id: newId, label, type, story, synchronous, unreliable, localNode: true };
				const newNodes = Nodes.concat( newNode );

				cache.writeQuery( {
					query: LOCAL_NODES_TAG,
					data: { Nodes: newNodes },
				} );
			},
			addLink: ( _root, variables, { cache } ) => {
				const { label, type, x_id, y_id, props, seq, x_end, y_end } = variables;
				const { optional, story } = props;
				const x = { id: x_id };
				const y = { id: y_id };
				const { Links } = cache.readQuery( { query: LOCAL_LINKS } );

				const newId = generateLocalUUID();
				const newLink = { id: newId, label, type, x, y, optional, story, x_end, y_end, sequence: seq };
				const newLinks = Links.concat( newLink );

				cache.writeQuery( {
					query: LOCAL_LINKS,
					data: { Links: newLinks },
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
					sequence() {
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
				console.log( 'reading local nodes' );
				const { Nodes } = cache.readQuery( { query: LOCAL_NODES } );
				const { deletedNodes } = cache.readQuery( { query: DELETED_NODES } );
				const { Links } = cache.readQuery( { query: LOCAL_LINKS } );
				const { deletedLinks } = cache.readQuery( { query: DELETED_LINKS } );

				let nodeToDelete = Nodes.find( node => node.id === variables.id );
				let newNodes = Nodes.filter( node => node.id !== variables.id );
				let linksCopy = JSON.parse( JSON.stringify( Links ) );
				let linksToDelete = [];

				linksCopy = linksCopy.map( link => {
					let sameNodes = link.x.id === link.y.id;
					let isToDeleteNode = link.x.id === nodeToDelete.id;
					if ( sameNodes && isToDeleteNode ) {
						linksToDelete.push( link );
					}
					else if ( link.x.id === nodeToDelete.id ) {
						link.x.id = link.y.id;
					}
					else if ( link.y.id === nodeToDelete.id ) {
						link.y.id = link.x.id;
					}
					return link;
				} );

				linksCopy = linksCopy.filter( link => {
					for ( let deletedLink of linksToDelete ) {
						if ( link.id === deletedLink.id ) {
							return false;
						}
					}
					return true;
				} );

				cache.writeQuery( {
					query: LOCAL_NODES,
					data: { Nodes: newNodes },
				} );

				cache.writeQuery( {
					query: DELETED_NODES,
					data: {
						deletedNodes: deletedNodes.concat( nodeToDelete ),
					},
				} );

				cache.writeQuery( {
					query: LOCAL_LINKS,
					data: { Links: linksCopy },
				} );

				cache.writeQuery( {
					query: DELETED_LINKS,
					data: {
						deletedLinks: deletedLinks.concat( linksToDelete ),
					},
				} );
			},
			deleteLink: ( _root, variables, { cache } ) => {
				const { Links } = cache.readQuery( { query: LOCAL_LINKS } );
				const { deletedLinks } = cache.readQuery( { query: DELETED_LINKS } );

				const newLinks = Links.filter( link => link.id !== variables.id );
				const linkToDelete = Links.filter( link => link.id === variables.id );
				console.log( 'new links', newLinks );
				console.log( 'linnk to delete', linkToDelete );

				cache.writeQuery( {
					query: LOCAL_LINKS,
					data: { Links: newLinks },
				} );

				cache.writeQuery( {
					query: DELETED_LINKS,
					data: {
						deletedLinks: deletedLinks.concat( linkToDelete ),
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
