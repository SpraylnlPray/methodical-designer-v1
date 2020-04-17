import React from 'react';
import Create from './components/Create';

class InputField {
	constructor( name, init, type = 'text' ) {
		this.name = name;
		this.init = init;
		this.type = type;
	}
}

const label = new InputField( 'label', '' );
const type = new InputField( 'type', '', 'select' );
const story = new InputField( 'story', '' );
const synchronous = new InputField( 'synchronous', false, 'checkbox' );
const unreliable = new InputField( 'unreliable', false, 'checkbox' );

const required = [ label, type ];
const props = [ story, synchronous, unreliable ];

function App() {
	return (
		<div>
			<Create required={required} props={ props }/>
		</div>
	);
}

export default App;
