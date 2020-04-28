import React, { useReducer, useState } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { GET_LOCAL_NODES } from '../queries/LocalQueries';
import { Confirm, Container, Form, Header } from 'semantic-ui-react';
import Status from './Status';
import { DELETE_NODE, UPDATE_NODE } from '../queries/ServerMutations';
import { enteredRequired, setActiveItem } from '../utils';
import { inputReducer } from '../InputReducer';

const EditNode = ( { activeItem, client } ) => {
	const [ open, setOpen ] = useState( false );

	const { data: { Nodes } } = useQuery( GET_LOCAL_NODES );
	const { label, type, story, synchronous, unreliable } = Nodes.find( node => node.id === activeItem.itemId );
	const inputs = { required: { label, type }, props: { story, synchronous, unreliable } };

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

	const [ runUpdate, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation( UPDATE_NODE );
	const [ runDelete, { data: deleteData, loading: deleteLoading, error: deleteError } ] = useMutation( DELETE_NODE );

	const handleChange = ( e, data ) => {
		const name = data.name;
		const value = data.type === 'checkbox' ? data.checked : data.value;
		const required = !!data.required;
		dispatch( { type: 'ADD', required, name, value } );
	};

	const handleSubmit = ( e ) => {
		e.preventDefault();
		if ( enteredRequired( store.required ) ) {
			// in this query all entries are optional as they can be edited or not
			// at some point I'll have to refactor this on the server side
			let props = { ...store.props, ...store.required };
			let variables = { id: activeItem.itemId, props };
			runUpdate( { variables } )
				.catch( e => console.log( e ) );
		}
		else {
			console.log( 'Must provide required inputs!' );
			alert( 'Must provide required inputs!' );
		}
	};

	const handleDelete = ( e ) => {
		e.preventDefault();
		runDelete( { variables: { id: activeItem.itemId } } )
			.then( data => setActiveItem( client, 'app', 'app' ) );
	};

	const handleCancel = ( e ) => {
		e.preventDefault();
		setOpen( false );
	};

	const openConfirmation = () => {
		setOpen( true );
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
				<Form.Button onClick={ handleSubmit }>Save!</Form.Button>
				<Form.Button onClick={ openConfirmation }>Delete</Form.Button>
				<Confirm
					open={ open }
					header='Delete Node?'
					confirmButton='Yes, Continue'
					content={ `This action can't be undone` }
					onConfirm={ handleDelete }
					onCancel={ handleCancel }
					size='mini'
				/>
			</Form>
			<Status data={ updateData } error={ updateError } loading={ updateLoading }/>
		</Container>
	);
};

export default EditNode;