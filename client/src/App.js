import React, { useState } from 'react';
import InteractionPane from './components/InteractionPane';
import EditorPane from './components/EditorPane';
import { Button, Grid, Header } from 'semantic-ui-react';
import './App.css';
import { setActiveItem } from './utils';
import { GET_SERVER_LINKS, GET_SERVER_NODES } from './queries/ServerQueries';
import {
	CREATE_LINK, CREATE_NODE, DELETE_LINK, DELETE_LINK_END, DELETE_NODE, DELETE_SEQUENCE, MERGE_LINK_END, MERGE_SEQUENCE,
	UPDATE_LINK, UPDATE_NODE,
} from './queries/ServerMutations';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { DELETED_LINKS, DELETED_NODES, LOCAL_LINKS_TAGS, LOCAL_NODES_TAGS } from './queries/LocalQueries';
import {
	deleteLinkEnd, deleteSequence, existsLinkEnd, existsSequence, saveLinkEnd, saveSequence,
} from './TransactionUtils';

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
	const [ runMergeSeq ] = useMutation( MERGE_SEQUENCE );
	const [ runDeleteSeq ] = useMutation( DELETE_SEQUENCE );
	const [ runMergeLinkEnd ] = useMutation( MERGE_LINK_END );
	const [ runDeleteLinkEnd ] = useMutation( DELETE_LINK_END );

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

			let promises = [];

			for ( let node of createdNodes ) {
				console.log( 'saving created node ', node );
				const { id, label, story, synchronous, type, unreliable } = node;
				const variables = { id, label, type, props: { story, synchronous, unreliable } };
				promises.push( runCreateNode( { variables } ) );
			}
			for ( let node of editedNodes ) {
				console.log( 'saving updated node ', node );
				const { id, label, story, synchronous, type, unreliable } = node;
				const variables = { id, props: { label, type, story, synchronous, unreliable } };
				promises.push( runUpdateNode( { variables } ) );
			}
			for ( let link of createdLinks ) {
				console.log( 'saving created link ', link );
				const { id, label, type, x: { id: x_id }, y: { id: y_id }, story, optional } = link;
				const variables = { id, label, type, x_id, y_id, props: { story, optional } };
				promises.push( runCreateLink( { variables } ) );
				if ( existsSequence( link ) ) {
					saveSequence( link, promises, runMergeSeq );
				}
				else {
					deleteSequence( link, promises, runDeleteSeq );
				}
				if ( existsLinkEnd( link, 'x_end' ) ) {
					saveLinkEnd( link, promises, 'x_end', runMergeLinkEnd );
				}
				else {
					deleteLinkEnd( link, promises, 'x_end', runDeleteLinkEnd );
				}
				if ( existsLinkEnd( link, 'y_end' ) ) {
					saveLinkEnd( link, promises, 'y_end', runMergeLinkEnd );
				}
				else {
					deleteLinkEnd( link, promises, 'y_end', runDeleteLinkEnd );
				}
			}
			for ( let link of editedLinks ) {
				console.log( 'saving edited link ', link );
				const { id, label, type, x: { id: x_id }, y: { id: y_id }, story, optional } = link;
				const variables = { id, props: { story, optional, label, type, x_id, y_id } };
				promises.push( runUpdateLink( { variables } ) );
				if ( existsSequence( link ) ) {
					saveSequence( link, promises, runMergeSeq );
				}
				else {
					deleteSequence( link, promises, runDeleteSeq );
				}
				if ( existsLinkEnd( link, 'x_end' ) ) {
					saveLinkEnd( link, promises, 'x_end', runMergeLinkEnd );
				}
				else {
					deleteLinkEnd( link, promises, 'x_end', runDeleteLinkEnd );
				}
				if ( existsLinkEnd( link, 'y_end' ) ) {
					saveLinkEnd( link, promises, 'y_end', runMergeLinkEnd );
				}
				else {
					deleteLinkEnd( link, promises, 'y_end', runDeleteLinkEnd );
				}
			}
			for ( let link of deletedLinks ) {
				console.log( 'deleting link ', link );
				const { id } = link;
				promises.push( runDeleteLink( { variables: { id } } ) );
			}
			for ( let node of deletedNodes ) {
				console.log( 'deleting node ', node );
				const { id } = node;
				promises.push( runDeleteNode( { variables: { id } } ) );
			}

			Promise.allSettled( promises )
				.then( () => {
					nodeRefetch();
					linkRefetch();
				} );
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
