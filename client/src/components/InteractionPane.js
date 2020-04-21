import React from 'react';
import OptionBar from './OptionBar';
import InputPane from './InputPane';
import { GET_ACTIVE_ITEM } from '../queries/LocalQueries';
import { useQuery } from '@apollo/react-hooks';

const InteractionPane = ( { client } ) => {
	const { data } = useQuery( GET_ACTIVE_ITEM );
	return (
		<div className='bordered interaction-pane margin-base'>
			{ data.activeItem }
			<OptionBar/>
			<InputPane client={ client } activeItem={ data.activeItem }/>
		</div>
	);
};

export default InteractionPane;