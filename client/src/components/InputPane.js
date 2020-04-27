import React from 'react';
import { setActiveItem } from '../utils';
import CreateLink from './CreateLink';
import CreateNode from './CreateNode';
import { CREATE_NODE, CREATE_LINK } from '../queries/ServerMutations';

const InputPane = ( { activeItem, client, nodeRefetch, linkRefetch } ) => {
	const handleClick = ( e ) => {
		e.stopPropagation();
		setActiveItem( client, activeItem.id, activeItem.type );
	};

	return (
		<div className='bordered input-pane margin-base' onClick={ e => handleClick( e ) }>
			{ activeItem.id === 'createnode' && activeItem.type === 'option' &&
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

			{ activeItem.id === 'createlink' && activeItem.type === 'option' &&
			<CreateLink
				clent={ client }
				refetch={ linkRefetch }
				mutation={ CREATE_LINK }
				inputs={ { required: { label: '', type: '', x_id: '', y_id: '' }, props: { story: '', optional: false } } }
				typeOptions={[
					{ "text": "Part Of", "value": "PartOf" },
					{ "text": "Trigger", "value": "Trigger" },
					{ "text": "Read", "value": "Read" },
					{ "text": "Mutate", "value": "Mutate" },
					{ "text": "Generic", "value": "Generic" }
				]}
			/> }
		</div>
	);
};

export default InputPane;