import React from 'react';
import { setActiveItem } from '../utils';
import CreateLink from './CreateLink';
import CreateNode from './CreateNode';
import { CREATE_NODE, CREATE_LINK } from '../queries/ServerMutations';
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
				client={ client }
				refetch={ nodeRefetch }
				mutation={ CREATE_NODE }
				inputs={ { required: { label: '', type: '' }, props: { story: '', synchronous: false, unreliable: false } } }
				typeOptions={ [
					{ 'text': 'API', 'value': 'API' },
					{ 'text': 'Event', 'value': 'Event' },
					{ 'text': 'Persistence', 'value': 'Persistence' },
					{ 'text': 'Abstract User Interface', 'value': 'AbstractUserInterface' },
					{ 'text': 'Query', 'value': 'Query' },
				] }
			/> }

			{ activeItem.itemId === 'createlink' && activeItem.itemType === 'option' &&
			<CreateLink
				clent={ client }
				refetch={ linkRefetch }
				mutation={ CREATE_LINK }
				inputs={ { required: { label: '', type: '', x_id: '', y_id: '' }, props: { story: '', optional: false } } }
				typeOptions={ [
					{ 'text': 'Part Of', 'value': 'PartOf' },
					{ 'text': 'Trigger', 'value': 'Trigger' },
					{ 'text': 'Read', 'value': 'Read' },
					{ 'text': 'Mutate', 'value': 'Mutate' },
					{ 'text': 'Generic', 'value': 'Generic' },
				] }
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