import React from 'react';
import OptionBar from './OptionBar';
import InputPane from './InputPane';

const InteractionPane = (props) => {
	return (
		<div className='bordered interaction-pane margin-base'>
			<OptionBar/>
			<InputPane/>
		</div>
	);
};

export default InteractionPane;