import React from 'react';
import { Message, Icon } from 'semantic-ui-react';

const Status = ( { loading, error, data } ) => {
	let errors = {};
	if ( error ) {
		errors = error.graphQLErrors.map( ( { message }, i ) => (
			<li className='content' key={ i }>{ message }</li>
		) );
	}
	return (
		<div>
			{ loading && (
				<Message icon>
					<Icon name='circle notched' loading/>
					<Message.Content>
						<Message.Header>Loading...</Message.Header>
					</Message.Content>
				</Message>
			) }
			{ error && (
				<Message error>
					<Message.Header>Error!</Message.Header>
					<Message.Content>
						{errors}
					</Message.Content>
				</Message>
			) }
			{ data && (
				<Message positive>
					<Message.Header>Success!</Message.Header>
				</Message>
			) }
		</div>
	);
};

export default Status;