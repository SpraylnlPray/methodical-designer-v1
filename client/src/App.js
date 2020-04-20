import React from 'react';
import Create from './components/Create';
import InteractionPane from './components/InteractionPane';
import EditorPane from './components/EditorPane';
import { Header, Grid } from 'semantic-ui-react';
import { CREATE_NODE, CREATE_LINK } from './queries/ServerMutations';
import './App.css';
import NodeInputs from './DefaultInputs/NodeInputs';
import LinkInputs from './DefaultInputs/LinkInputs';

function App() {
	return (
		<div className='bordered app margin-base'>
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
			{/*<Create inputs={ NodeInputs } mutation={ CREATE_NODE } header='Create a Node'/>*/ }
			{/*<Create inputs={ LinkInputs } mutation={ CREATE_LINK } header='Create a Link'/>*/ }
		</div>
	);
}

export default App;
