import React, { useReducer } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { GET_LINKS } from '../queries/LocalQueries';
import { Container, Form, Header } from 'semantic-ui-react';
import Status from './Status';
import { UPDATE_LINK } from '../queries/ServerMutations';
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

const EditNode = ( { activeItem } ) => {

	const { data: { Links } } = useQuery( GET_LINKS );
	const editedLink = Links.find( link => link.id === activeItem.itemId );
	const { label, type, x: { id: x_id }, y: { id: y_id }, story, optional } = editedLink;
	const inputs = { required: { label, type, x_id, y_id }, props: { story, optional } };
	const typeOptions = [
		{ 'text': 'Part Of', 'value': 'PartOf' },
		{ 'text': 'Trigger', 'value': 'Trigger' },
		{ 'text': 'Read', 'value': 'Read' },
		{ 'text': 'Mutate', 'value': 'Mutate' },
		{ 'text': 'Generic', 'value': 'Generic' },
	];

	const [ store, dispatch ] = useReducer(
		inputReducer,
		{ ...inputs, justMutated: false },
	);

	const [ runMutation, { data, loading, error } ] = useMutation( UPDATE_LINK );

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
			runMutation( { variables: { id: activeItem.itemId, props } } )
				.catch( e => console.log( e ) );
		}
		else {
			console.log( 'Must provide required inputs!' );
			alert( 'Must provide required inputs!' );
		}
	};

	return (
		<Container>
			<Header as='h2'>Edit a Link!</Header>
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
						label='X-Node ID'
						placeholder='X-ID'
						required
						onChange={ handleChange }
						name='x_id'
						value={ store.required['x_id'] }
					/>
					<Form.Input
						fluid
						className='create-required-input create-input'
						label='Y-Node ID'
						required
						placeholder='Y-ID'
						onChange={ handleChange }
						name='y_id'
						value={ store.required['y_id'] }
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
						label='optional'
						onChange={ handleChange }
						checked={ store.props['optional'] }
						name='optional'
					/>
				</Form.Group>
				<Form.Button onClick={ handleSubmit }>Update!</Form.Button>
			</Form>
			<Status data={ data } error={ error } loading={ loading }/>
		</Container>
	);
};

export default EditNode;