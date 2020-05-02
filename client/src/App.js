import React, { useState } from 'react';
import InteractionPane from './components/InteractionPane';
import EditorPane from './components/EditorPane';
import { Button, Grid, Header } from 'semantic-ui-react';
import './App.css';
import { setActiveItem } from './utils';
import { GET_SERVER_LINKS, GET_SERVER_NODES } from './queries/ServerQueries';
import { CREATE_NODE } from './queries/ServerMutations';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { GET_LOCAL_NODES } from './queries/LocalQueries';

function App() {
	const id = 'app';
	const client = useApolloClient();
	let [ makeAppActive, setMakeAppActive ] = useState( true );
	const [ runCreateNode ] = useMutation( CREATE_NODE );

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

	const { data } = useQuery( GET_LOCAL_NODES );

	const handleSave = e => {
		if ( data?.Nodes ) {
			const { Nodes } = data;
			for ( let node of Nodes ) {
				if ( Number( node.id ) < 10000 ) {
					const { label, story, synchronous, type, unreliable } = node;
					runCreateNode( { variables: { label, type, props: { story, synchronous, unreliable } } } );
				}
			}
		}
	};

	return (
		<div className='bordered app margin-base' onClick={ handleClick }>
			<Header as='h1'>Methodical Designer</Header>
			<Button onClick={ handleSave }>Save to DB</Button>
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
};

export default App;
