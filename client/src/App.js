import React from 'react';
import InteractionPane from './components/InteractionPane';
import EditorPane from './components/EditorPane';
import { Header, Grid } from 'semantic-ui-react';
import { useApolloClient } from '@apollo/react-hooks';
import './App.css';
import { setActiveItem } from './utils';

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

	return (
		<div className='bordered app margin-base' onClick={ handleClick }>
			<Header as='h1'>Methodical Designer</Header>
			<Grid>
				<Grid.Row>
					<Grid.Column width={ 4 }>
						<InteractionPane client={client}/>
					</Grid.Column>
					<Grid.Column width={ 12 }>
						<EditorPane/>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</div>
	);
}

export default App;
