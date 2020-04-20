import React from 'react';
import OptionBar from './OptionBar';
import InputPane from './InputPane';
import { GET_ACTIVE_ITEM } from '../queries/LocalQueries';
import { useQuery } from '@apollo/react-hooks';

const InteractionPane = ( props ) => {
	const { data } = useQuery( GET_ACTIVE_ITEM );
	return (
		<div className='bordered interaction-pane margin-base'>
			{ data.activeItem }
			<OptionBar/>
			<InputPane/>
		</div>
	);
};

export default InteractionPane;