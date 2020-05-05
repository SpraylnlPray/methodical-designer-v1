import React, { useState } from 'react';
import InteractionPane from './components/InteractionPane';
import EditorPane from './components/EditorPane';
import { Button, Grid, Header } from 'semantic-ui-react';
import './App.css';
import { setActiveItem } from './utils';
import { GET_SERVER_LINKS, GET_SERVER_NODES } from './queries/ServerQueries';
import {
	CREATE_LINK, CREATE_NODE, DELETE_LINK, DELETE_NODE, UPDATE_LINK, UPDATE_NODE,
} from './queries/ServerMutations';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { DELETED_LINKS, DELETED_NODES, LOCAL_LINKS_TAGS, LOCAL_NODES_TAGS } from './queries/LocalQueries';

function App() {
	const id = 'app';
	const client = useApolloClient();
	let [ makeAppActive, setMakeAppActive ] = useState( true );
	const [ runCreateNode ] = useMutation( CREATE_NODE );
	const [ runUpdateNode ] = useMutation( UPDATE_NODE );
	const [ runCreateLink ] = useMutation( CREATE_LINK );
	const [ runUpdateLink ] = useMutation( UPDATE_LINK );
	const [ runDeleteNode ] = useMutation( DELETE_NODE );
	const [ runDeleteLink ] = useMutation( DELETE_LINK );

	const handleClick = ( e ) => {
		// this is for the editor. the editor can set this property to false as stopping the propagation of the vis
		// event does not seem to be possible.
		if ( makeAppActive ) {
			setActiveItem( client, id, 'app' );
		}
		setMakeAppActive( true );
	};

	const { data: nodeData, refetch: nodeRefetch } = useQuery( GET_SERVER_NODES );
	const { data: linkData, refetch: linkRefetch } = useQuery( GET_SERVER_LINKS );

	const { data: localNodeData } = useQuery( LOCAL_NODES_TAGS );
	const { data: localLinkData } = useQuery( LOCAL_LINKS_TAGS );
	const { data: deletedNodesData } = useQuery( DELETED_NODES );
	const { data: deletedLinksData } = useQuery( DELETED_LINKS );

	const handleSave = e => {
		if ( localNodeData?.Nodes && localLinkData?.Links ) {
			const { Nodes } = localNodeData;
			const { Links } = localLinkData;

			const createdNodes = Nodes.filter( node => node.created );
			const notNewlyCreatedNodes = Nodes.filter( node => !node.created );
			const editedNodes = notNewlyCreatedNodes.filter( node => node.edited );

			const createdLinks = Links.filter( link => link.created );
			const notNewlyCreatedLinks = Links.filter( link => !link.created );
			const editedLinks = notNewlyCreatedLinks.filter( link => link.edited );

			const { deletedNodes } = deletedNodesData;
			const { deletedLinks } = deletedLinksData;

			for ( let node of createdNodes ) {
				console.log( 'saving created node ', node );
				const { id, label, story, synchronous, type, unreliable } = node;
				const variables = { id, label, type, props: { story, synchronous, unreliable } };
				runCreateNode( { variables } );
			}
			for ( let node of editedNodes ) {
				console.log( 'saving updated node ', node );
				const { id, label, story, synchronous, type, unreliable } = node;
				const variables = { id, props: { label, type, story, synchronous, unreliable } };
				runUpdateNode( { variables } );
			}
			for ( let link of createdLinks ) {
				console.log( 'saving created link ', link );
				const { id, label, type, x: { id: x_id }, y: { id: y_id }, story, optional } = link;
				const variables = { id, label, type, x_id, y_id, props: { story, optional } };
				runCreateLink( { variables } );
			}
			for ( let link of editedLinks ) {
				console.log( 'saving edited link ', link );
				const { id, label, type, x: { id: x_id }, y: { id: y_id }, story, optional } = link;
				const variables = { id, props: { story, optional, label, type, x_id, y_id } };
				runUpdateLink( { variables } );
			}
			for ( let link of deletedLinks ) {
				console.log( 'deleting link ', link );
				const { id } = link;
				runDeleteLink( { variables: { id } } );
			}
			for ( let node of deletedNodes ) {
				console.log( 'deleting node ', node );
				const { id } = node;
				runDeleteNode( { variables: { id } } );
			}

			// todo: when data is fetched reset the local cache so that the 'updated' and 'created' are being reset
			// todo: find a way to wait long enough
			// nodeRefetch();

			setTimeout( () => {
				console.log( 'refetching now' );
				nodeRefetch()
					.then( data => console.log( 'data from node refetch: ', data ) );
				linkRefetch();
			}, 1000 );
		}
	};

	return (
		<div className='bordered app margin-base' onClick={ handleClick }>
			<div className='bordered margin-base head-area'>
				<Header as='h1'>Methodical Designer</Header>
				<Button onClick={ handleSave }>Save to DB</Button>
			</div>
			<Grid>
				<Grid.Row>
					<Grid.Column width={ 4 }>
						<InteractionPane
							linkRefetch={ linkRefetch }
							nodeRefetch={ nodeRefetch }
							client={ client }
						/>
					</Grid.Column>
					<Grid.Column width={ 12 }>
						{ nodeData && linkData && (
							<EditorPane
								setMakeAppActive={ setMakeAppActive }
								client={ client }
								nodeData={ nodeData }
								linkData={ linkData }
							/>
						) }
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</div>
	);
}

export default App;
