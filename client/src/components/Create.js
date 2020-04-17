import React, { useReducer } from 'react';
import { Container, Form, Header } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import { CREATE_NODE } from '../queries/ServerMutations';

const options = [
	{ text: 'API', value: 'API' },
	{ text: 'Event', value: 'Event' },
	{ text: 'Persistence', value: 'Persistence' },
	{ text: 'Abstract User Interface', value: 'AbstractUserInterface' },
];

const inputReducer = ( state, action ) => {
	switch ( action.type ) {
		case 'ADD':
			if ( action.required ) {
				let required = state.required;
				required[action.name] = action.value;
				return { ...state, required };
			}
			else {
				let props = state.props;
				props[action.name] = action.value;
				return { ...state, props };
			}
		default:
			return state;
	}
};

function Create( fields ) {
	const [ inputs, setInputs ] = useReducer(
		inputReducer,
		fields,
	);

	const [ createNode, { data, loading, error } ] = useMutation( CREATE_NODE, { onCompleted: data => console.log( data ) } );

	const handleChange = ( e, data ) => {
		const name = data.name;
		const value = data.type === 'checkbox' ? data.checked : data.value;
		const required = !!data.required;
		setInputs( { type: 'ADD', required, name, value } );
	};

	const handleSubmit = ( e ) => {
		e.preventDefault();
		if ( enteredRequired( inputs.required ) ) {
			createNode( { variables: { ...inputs.required, props: inputs.props } } )
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
						value={ inputs.required.label }
					/>
					<Form.Select
						fluid
						label='Type'
						options={ options }
						placeholder='Type'
						onChange={ handleChange }
						required
						name='type'
						value={ inputs.required.type }
					/>
					<Form.Input
						fluid
						label='Story'
						placeholder='Story'
						onChange={ handleChange }
						name='story'
						value={ inputs.props.story }
					/>
					<Form.Checkbox label='Synchronous' onChange={ handleChange } name='synchronous'/>
					<Form.Checkbox label='Unreliable' onChange={ handleChange } name='unreliable'/>
				</Form.Group>
				<Form.Button onClick={ handleSubmit }>Create!</Form.Button>
			</Form>
			{ loading && <p>Loading...</p> }
			{ error && error.graphQLErrors.map( ( { message }, i ) => {
				return <span key={ i }>{ message }</span>;
			} ) }
			{ data && <p>Created Node { data.CreateNode.node.label }</p> }
		</Container>
	);
}

function enteredRequired( requiredFields ) {
	for ( let key of Object.keys( requiredFields ) ) {
		if ( requiredFields[key].length <= 0 ) {
			return false;
		}
	}
	return true;
}

export default Create;