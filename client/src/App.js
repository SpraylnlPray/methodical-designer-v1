import React from 'react';
import Create from './components/Create';
import { CREATE_NODE } from './queries/ServerMutations';
import './App.css';

const fields = {
	required: { label: '', type: '' },
	props: { story: '', synchronous: false, unreliable: false },
};

function App() {
	return (
		<div>
			<Create fields={ fields } mutation={ CREATE_NODE }/>
		</div>
	);
}

export default App;
