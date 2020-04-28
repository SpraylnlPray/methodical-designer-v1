import React from 'react';
import { setActiveItem } from '../utils';
import CreateLink from './CreateLink';
import CreateNode from './CreateNode';
import EditNode from './EditNode';
import EditLink from './EditLink';

const InputPane = ( { activeItem, client, nodeRefetch, linkRefetch } ) => {
	const handleClick = ( e ) => {
		e.stopPropagation();
		setActiveItem( client, activeItem.itemId, activeItem.itemType );
	};

	return (
		<div className='bordered input-pane margin-base' onClick={ e => handleClick( e ) }>
			{ activeItem.itemId === 'createnode' && activeItem.itemType === 'option' &&
			<CreateNode
				refetch={ nodeRefetch }
			/> }
			{ activeItem.itemId === 'createlink' && activeItem.itemType === 'option' &&
			<CreateLink
				refetch={ linkRefetch }
			/> }

			{ activeItem.itemType === 'node' &&
			<EditNode
				client={ client }
				activeItem={ activeItem }
			/> }
			{ activeItem.itemType === 'link' &&
			<EditLink
				client={ client }
				activeItem={ activeItem }
			/> }
		</div>
	);
};

export default InputPane;