import React from 'react';
import Create from './components/Create';
import { CREATE_NODE, CREATE_LINK } from './queries/ServerMutations';
import './App.css';
import NodeInputs from './DefaultInputs/NodeInputs';
import LinkInputs from './DefaultInputs/LinkInputs';

function App() {
	return (
		<div>
			<Create inputs={ NodeInputs } mutation={ CREATE_NODE } header='Create a Node'/>
			<Create inputs={ LinkInputs } mutation={ CREATE_LINK } header='Create a Link'/>
		</div>
	);
}

export default App;
