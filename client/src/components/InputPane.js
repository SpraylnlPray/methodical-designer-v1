import React from 'react';
import { setActiveItem } from '../utils';
import Create from './Create';
import NodeInputs from '../DefaultInputs/NodeInputs';
import { CREATE_NODE, CREATE_LINK } from '../queries/ServerMutations';
import LinkInputs from '../DefaultInputs/LinkInputs';

const InputPane = ( { activeItem, client, nodeRefetch, linkRefetch } ) => {
	const handleClick = ( e ) => {
		e.stopPropagation();
		setActiveItem( client, activeItem );
	};

	return (
		<div className='bordered input-pane margin-base' onClick={ e => handleClick( e ) }>
			{ activeItem === 'createnode' &&
			<Create refetch={ nodeRefetch } inputs={ NodeInputs } mutation={ CREATE_NODE }
							header='Create a Node'/> }
			{ activeItem === 'createlink' &&
			<Create refetch={ linkRefetch } inputs={ LinkInputs } mutation={ CREATE_LINK }
							header='Create a Link'/> }

		</div>
	);
};

export default InputPane;