import React, { useReducer, useState } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { GET_LOCAL_LINKS, GET_LOCAL_NODES } from '../queries/LocalQueries';
import { Container, Form, Header, Confirm } from 'semantic-ui-react';
import Status from './Status';
import { DELETE_LINK, UPDATE_LINK } from '../queries/ServerMutations';
import { enteredRequired, setActiveItem } from '../utils';
import { inputReducer } from '../InputReducer';

const EditLink = ( { activeItem, client } ) => {
	const [ open, setOpen ] = useState( false );

	const { data: { Links } } = useQuery( GET_LOCAL_LINKS );
	const { label, type, x: { id: x_id }, y: { id: y_id }, story, optional } = Links.find( link => link.id === activeItem.itemId );
	const inputs = { required: { label, type, x_id, y_id }, props: { story: story ? story : '', optional } };

	const { data: { Nodes } } = useQuery( GET_LOCAL_NODES );
	const nodeOptions = Nodes.map( node => ({ 'text': node.label, 'value': node.id }) );

	const typeOptions = [
		{ 'text': 'Part Of', 'value': 'PartOf' },
		{ 'text': 'Trigger', 'value': 'Trigger' },
		{ 'text': 'Read', 'value': 'Read' },
		{ 'text': 'Mutate', 'value': 'Mutate' },
		{ 'text': 'Generic', 'value': 'Generic' },
	];

	const [ store, dispatch ] = useReducer(
		inputReducer,
		{ ...inputs },
	);

	const [ runUpdate, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation( UPDATE_LINK );
	const [ runDelete, { data: deleteData, loading: deleteLoading, error: deleteError } ] = useMutation( DELETE_LINK );

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
			runUpdate( { variables: { id: activeItem.itemId, props } } )
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
					<Form.Select
						fluid
						className='create-required-select create-input'
						label='X-Node'
						placeholder='X-Node'
						required
						onChange={ handleChange }
						options={ nodeOptions }
						name='x_id'
						value={ store.required['x_id'] }
					/>
					<Form.Select
						fluid
						className='create-required-select create-input'
						label='Y-Node'
						placeholder='Y-Node'
						required
						onChange={ handleChange }
						options={ nodeOptions }
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
				<Form.Button onClick={ openConfirmation }>Delete</Form.Button>
				<Confirm
					open={ open }
					header='Delete Link?'
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

export default EditLink;