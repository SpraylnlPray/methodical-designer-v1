import React, { useReducer } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { GET_NODES } from '../queries/LocalQueries';
import { Container, Form, Header } from 'semantic-ui-react';
import Status from './Status';
import { UPDATE_NODE } from '../queries/ServerMutations';
import { enteredRequired } from '../utils';

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
		case 'SET_JUST_MUTATED':
			return { ...state, justMutated: action.value };
		default:
			return state;
	}
};

const EditNode = ( { mutation, activeItem } ) => {

	const { data: { Nodes } } = useQuery( GET_NODES );
	const editedNode = Nodes.find( node => node.id === activeItem.id );
	const { label, type, story, synchronous, unreliable } = editedNode;
	const inputs = { required: { label, type }, props: { story, synchronous, unreliable } };

	console.log( editedNode );

	const typeOptions = [
		{ 'text': 'API', 'value': 'API' },
		{ 'text': 'Event', 'value': 'Event' },
		{ 'text': 'Persistence', 'value': 'Persistence' },
		{ 'text': 'Abstract User Interface', 'value': 'AbstractUserInterface' },
		{ 'text': 'Query', 'value': 'Query' },
	];

	const [ store, dispatch ] = useReducer(
		inputReducer,
		{ ...inputs, justMutated: false },
	);

	const [ runMutation, { data, loading, error } ] = useMutation( UPDATE_NODE );

	const handleChange = ( e, data ) => {
		const name = data.name;
		const value = data.type === 'checkbox' ? data.checked : data.value;
		const required = !!data.required;
		dispatch( { type: 'ADD', required, name, value } );
	};

	const handleSubmit = ( e ) => {
		e.preventDefault();
		if ( enteredRequired( store.required ) ) {
			dispatch( { type: 'SET_JUST_MUTATED', value: true } );
			// in this query all entries are optional as they can be edited or not
			// at some point I'll have to refactor this on the server side
			let props = { ...store.props, ...store.required };
			let variables = { id: activeItem.id, props };
			runMutation( { variables } )
				.catch( e => console.log( e ) );
		}
		else {
			console.log( 'Must provide required inputs!' );
			alert( 'Must provide required inputs!' );
		}
	};

	return (
		<Container>
			<Header as='h2'>Edit a Node!</Header>
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
						value={ store.required['label'] }
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
						value={ store.required['type'] }
					/>
					<Form.Input
						fluid
						className='create-required-input create-input'
						label='Story'
						placeholder='Story'
						onChange={ handleChange }
						name='story'
						value={ store.props['story'] }
					/>
					<Form.Checkbox
						className='create-input'
						label='Synchronous'
						onChange={ handleChange }
						checked={ store.props['synchronous'] }
						name='synchronous'
					/>
					<Form.Checkbox
						className='create-input'
						label='Unreliable'
						onChange={ handleChange }
						checked={ store.props['unreliable'] }
						name='unreliable'
					/>
				</Form.Group>
				<Form.Button onClick={ handleSubmit }>Create!</Form.Button>
			</Form>
			<Status data={ data } error={ error } loading={ loading }/>
		</Container>
	);
};

export default EditNode;