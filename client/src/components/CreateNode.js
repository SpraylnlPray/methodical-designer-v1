import React, { useReducer } from 'react';
import { Container, Form, Header } from 'semantic-ui-react';
import Status from './Status';
import { inputReducer } from '../InputReducer';
import { useMutation } from '@apollo/react-hooks';
import { CREATE_NODE } from '../queries/ServerMutations';
import { enteredRequired } from '../utils';

// inputs comes from the HOC managing the input and is the object that is saved in the state
// props.inputs is the whole object containing information about the type of input etc. for rendering
function CreateNode( props ) {
	const inputs = { required: { label: '', type: '' }, props: { story: '', synchronous: false, unreliable: false } };
	const typeOptions = [
		{ 'text': 'API', 'value': 'API' },
		{ 'text': 'Event', 'value': 'Event' },
		{ 'text': 'Persistence', 'value': 'Persistence' },
		{ 'text': 'Abstract User Interface', 'value': 'AbstractUserInterface' },
		{ 'text': 'Query', 'value': 'Query' },
	];

	const [ localStore, localDispatch ] = useReducer(
		inputReducer,
		{ ...inputs, justMutated: false },
	);
	const [ runMutation, { data, loading, error } ] = useMutation( CREATE_NODE );

	const handleChange = ( e, data ) => {
		const name = data.name;
		const value = data.type === 'checkbox' ? data.checked : data.value;
		const required = !!data.required;
		localDispatch( { type: 'ADD', required, name, value } );
	};

	const handleSubmit = ( e ) => {
		e.preventDefault();
		if ( enteredRequired( localStore.required ) ) {
			runMutation( { variables: { ...localStore.required, props: localStore.props } } )
				.catch( e => console.log( e ) );
		}
		else {
			console.log( 'Must provide required inputs!' );
			alert( 'Must provide required inputs!' );
		}
	};

	return (
		<Container>
			<Header as='h2'>Create a Node!</Header>
			<Form className='create-form'>
				<Form.Group className='create-group'>
					<Form.Input
						fluid
						className='create-required-input create-input'
						label='Label'
						placeholder='Label'
						onChange={ handleChange }
						required
						name='label'
						value={ localStore.required['label'] }
					/>
					<Form.Select
						className='create-required-select create-input'
						fluid
						label='Type'
						options={ typeOptions }
						placeholder='Type'
						onChange={ handleChange }
						required
						name='type'
						value={ localStore.required['type'] }
					/>
					<Form.Input
						fluid
						className='create-required-input create-input'
						label='Story'
						placeholder='Story'
						onChange={ handleChange }
						name='story'
						value={ localStore.props['story'] }
					/>
					<Form.Checkbox
						className='create-input'
						label='Synchronous'
						onChange={ handleChange }
						checked={ localStore.props['synchronous'] }
						name='synchronous'
					/>
					<Form.Checkbox
						className='create-input'
						label='Unreliable'
						onChange={ handleChange }
						checked={ localStore.props['unreliable'] }
						name='unreliable'
					/>
				</Form.Group>
				<Form.Button onClick={ handleSubmit }>Create!</Form.Button>
			</Form>
			<Status data={ data } error={ error } loading={ loading }/>
		</Container>
	);
}

export default CreateNode;
