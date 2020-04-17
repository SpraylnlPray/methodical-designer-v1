import React from 'react';

const Status = ( { loading, error, data } ) => {
	return (
		<div>
			{ loading && <p>Loading...</p> }
			{ error && error.graphQLErrors.map( ( { message }, i ) => {
				return <span key={ i }>{ message }</span>;
			} ) }
			{ data && <p>Created Node { data.CreateNode.node.label }</p> }
		</div>
	);
};

export default Status;