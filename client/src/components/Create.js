import React, { useReducer, useState } from 'react';
import { Container, Form, Header } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import { CREATE_NODE } from '../queries/mutations';


const options = [
	{ text: 'API', value: 'API' },
	{ text: 'Event', value: 'Event' },
	{ text: 'Persistence', value: 'Persistence' },
	{ text: 'Abstract User Interface', value: 'AbstractUserInterface' },
];

function Create( { inputs } ) {
	const [ input, setInput ] = useReducer(
		( state, newState ) => ({ ...state, ...newState }),
		inputs,
	);
	const [ data, setData ] = useState( null );

	const [ createNode, { loading, error } ] = useMutation( CREATE_NODE, {
		onCompleted: data => setData( data ),
	} );

	const handleChange = ( e, data ) => {
		const name = data.name;
		const value = data.value;
		setInput( { [name]: value } );
	};

	const handleSubmit = ( e ) => {
		console.log( input );
		e.preventDefault();
		if ( input.label.length > 0 && input.type.length > 0 ) {
			createNode( { variables: { label: input.label, type: input.type, props: {} } } )
				.catch( e => console.log( e ) );
		}
		else {
			console.log( 'Must provide label and type!' );
			alert( 'Must provide label and type!' );
		}
	};

	return (
		<Container>
			<Header as='h2'>Create a Node</Header>
			<Form>
				<Form.Group widths='equal'>
					<Form.Input
						fluid
						label='Label'
						placeholder='Label'
						onChange={ handleChange }
						required
						name='label'
						value={ input.label }/>
					<Form.Select
						fluid
						label='Type'
						options={ options }
						placeholder='Type'
						onChange={ handleChange }
						name='type'
						value={ input.type }
					/>
				</Form.Group>
				<Form.Button onClick={ handleSubmit }>Create!</Form.Button>
			</Form>
			{ loading && <p>Loading...</p> }
			{ error && error.graphQLErrors.map( ( { message }, i ) => {
				return <span key={ i }>{ message }</span>;
			} ) }
			{ data && (
				<p>Created Node {data.CreateNode.node.label}</p>
			) }

		</Container>
	);

}

export default Create;