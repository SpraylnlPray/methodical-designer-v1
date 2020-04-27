import React, { useState } from 'react';
import InteractionPane from './components/InteractionPane';
import EditorPane from './components/EditorPane';
import { Header, Grid } from 'semantic-ui-react';
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import './App.css';
import { setActiveItem } from './utils';
import { GET_NODES, GET_LINKS } from './queries/ServerQueries';

function App() {
	const id = 'app';
	const client = useApolloClient();
	let [ makeAppActive, setMakeAppActive ] = useState( true );

	const handleClick = ( e ) => {
		// this is for the editor. the editor can set this property to false as stopping the propagation of the vis
		// event does not seem to be possible.
		if ( makeAppActive ) {
			setActiveItem( client, id, 'app' );
		}
		setMakeAppActive( true );
	};

	const { loading: nodeLoading, error: nodeError, data: nodeData, refetch: nodeRefetch } = useQuery( GET_NODES );
	const { loading: linkLoading, error: linkError, data: linkData, refetch: linkRefetch } = useQuery( GET_LINKS );

	return (
		<div className='bordered app margin-base' onClick={ handleClick }>
			<Header as='h1'>Methodical Designer</Header>
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
