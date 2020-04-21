import React from 'react';
import { setActiveItem } from '../utils';
import Create from './Create';
import NodeInputs from '../DefaultInputs/NodeInputs';
import { CREATE_NODE, CREATE_LINK } from '../queries/ServerMutations';
import LinkInputs from '../DefaultInputs/LinkInputs';

const InputPane = ( { activeItem, client } ) => {
	const handleClick = ( e ) => {
		// setActiveItem = false tells app.js to not overwrite the active item property
		// a click on the input pane shouldn't change the active item
		e.setActiveItem = false;
		setActiveItem( client, activeItem );
	};

	return (
		<div className='bordered input-pane margin-base' onClick={ e => handleClick( e ) }>
			{ activeItem === 'createnode' &&
			<Create inputs={ NodeInputs } mutation={ CREATE_NODE } header='Create a Node'/> }
			{ activeItem === 'createlink' &&
			<Create inputs={ LinkInputs } mutation={ CREATE_LINK } header='Create a Link'/> }

		</div>
	);
};

export default InputPane;