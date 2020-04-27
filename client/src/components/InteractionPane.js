import React from 'react';
import OptionBar from './OptionBar';
import InputPane from './InputPane';
import { GET_ACTIVE_ITEM } from '../queries/LocalQueries';
import { useQuery } from '@apollo/react-hooks';

const InteractionPane = ( { client, nodeRefetch, linkRefetch } ) => {
	const { data: { activeItem } } = useQuery( GET_ACTIVE_ITEM );
	return (
		<div className='bordered interaction-pane margin-base'>
			{ activeItem.id }
			<OptionBar/>
			<InputPane
				client={ client }
				linkRefetch={ linkRefetch }
				nodeRefetch={ nodeRefetch }
				activeItem={ activeItem }/>
		</div>
	);
};

export default InteractionPane;