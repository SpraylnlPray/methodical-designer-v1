import React from 'react';
import InteractionPane from './components/InteractionPane';
import EditorPane from './components/EditorPane';
import { Header, Grid } from 'semantic-ui-react';
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import './App.css';
import { setActiveItem } from './utils';
import { GET_NODES, GET_LINKS } from './queries/ServerQueries';

function App() {
	const name = 'app';
	const client = useApolloClient();

	const handleClick = ( e ) => {
		// if the user clicks at a spot that is not a creation button, or the input pane (and later a node)
		// we set the active item as the app so that in the interaction pane we can show the view options
		if ( e.setActiveItem ) {
			setActiveItem( client, name );
		}
		e.setActiveItem = true;
	};

	const { loading: nodeLoading, error: nodeError, data: nodeData, refetch: nodeRefetch } = useQuery( GET_NODES );
	const { loading: linkLoading, error: linkError, data: linkData, refetch: linkRefetch } = useQuery( GET_LINKS );

	return (
		<div className='bordered app margin-base' onClick={ handleClick }>
			<Header as='h1'>Methodical Designer</Header>
			<Grid>
				<Grid.Row>
					<Grid.Column width={ 4 }>
						<InteractionPane linkRefetch={linkRefetch} nodeRefetch={ nodeRefetch } client={ client }/>
					</Grid.Column>
					<Grid.Column width={ 12 }>
						<EditorPane client={client} nodeData={ nodeData } linkData={linkData}/>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</div>
	);
}

export default App;
