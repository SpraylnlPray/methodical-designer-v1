import React from 'react';
import { Button } from 'semantic-ui-react';
import { setActiveItem } from '../utils';
import { useApolloClient } from '@apollo/react-hooks';

const OptionBar = props => {
	const client = useApolloClient();

	const handleClick = ( e ) => {
		// set = false tells app.js to not overwrite the active item property
		e.setActiveItem = false;
		setActiveItem( client, e.target.value );
	};

	return (
		<div className='bordered margin-base'>
			<Button value='createnode' onClick={ e => handleClick( e ) }>Create Node</Button>
			<Button value='createlink' onClick={ e => handleClick( e ) }>Create Link</Button>
		</div>
	);
};

export default OptionBar;