import React from 'react';
import { Button } from 'semantic-ui-react';
import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const OptionBar = props => {
	const client = useApolloClient();

	const handleClick = ( e ) => {
		// dont set tells app.js to not overwrite the active item property
		e.dontSet = true;
		client.writeQuery( {
			query: gql`query {activeItem}`,
			data: { activeItem: e.target.value },
		} );
	};

	return (
		<div className='bordered margin-base'>
			<Button value='createnode' onClick={ e => handleClick( e ) }>Create Node</Button>
			<Button value='createlink' onClick={ e => handleClick( e ) }>Create Link</Button>
		</div>
	);
};

export default OptionBar;