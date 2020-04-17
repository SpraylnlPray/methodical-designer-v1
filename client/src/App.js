import React from 'react';
import Create from './components/Create';

function App() {
	return (
		<div>
			<Create required={ { label: '', type: '' } } props={ { story: '', synchronous: false, unreliable: false } }/>
		</div>
	);
}

export default App;
