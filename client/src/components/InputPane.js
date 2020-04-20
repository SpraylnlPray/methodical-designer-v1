import React from 'react';
import { useApolloClient } from '@apollo/react-hooks';
import gql from 'graphql-tag';
// import Create from './Create';
// import NodeInputs from '../DefaultInputs/NodeInputs';
// import { CREATE_NODE } from '../queries/ServerMutations';


const InputPane = ( props ) => {
	const client = useApolloClient();
	const name = 'inputpane';

	const handleClick = ( e ) => {
		// dont set tells app.js to not overwrite the active item property
		e.dontSet = true;
		client.writeQuery( {
			query: gql`query{activeItem}`,
			data: { activeItem: name },
		} );
	};

	return (
		<div className='bordered input-pane margin-base' onClick={ e => handleClick( e ) }>
			InputPane
			{/*	Depending on activeItem (passed from InteractionPane) render createNode, createLink, or view Options*/ }
		</div>
	);
};

export default InputPane;