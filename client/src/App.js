import React from 'react';
// import Create from './components/Create';
import InteractionPane from './components/InteractionPane';
import EditorPane from './components/EditorPane';
import { Header, Grid } from 'semantic-ui-react';
import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';
// import { CREATE_NODE, CREATE_LINK } from './queries/ServerMutations';
import './App.css';
// import NodeInputs from './DefaultInputs/NodeInputs';
// import LinkInputs from './DefaultInputs/LinkInputs';

// import clickDelegator from './scripts/ClickDelegator';

function App() {
	const name = 'app';
	const client = useApolloClient();

	const handleClick = ( e ) => {
		// if the user clicks at a spot that is not a creation button, or the input pane (and later a node)
		// we set the active item as the app so that in the interaction pane we can show the view options
		if ( !e.dontSet ) {
			client.writeQuery( {
				query: gql`{activeItem}`,
				data: { activeItem: name },
			} );
		}
		e.dontSet = false;
	};

	return (
		<div className='bordered app margin-base' onClick={ handleClick }>
			<Header as='h1'>Methodical Designer</Header>
			<Grid>
				<Grid.Row>
					<Grid.Column width={ 4 }>
						<InteractionPane/>
					</Grid.Column>
					<Grid.Column width={ 12 }>
						<EditorPane/>
					</Grid.Column>
				</Grid.Row>
			</Grid>
			{/*<Create inputs={ NodeInputs } mutation={ CREATE_NODE } header='Create a Node'/>*/}
			{/*<Create inputs={ LinkInputs } mutation={ CREATE_LINK } header='Create a Link'/>*/}
		</div>
	);
}

export default App;
