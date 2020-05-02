import React, { useReducer } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_LOCAL_LINKS, GET_LOCAL_NODES } from '../queries/LocalQueries';
import { Container, Form, Header } from 'semantic-ui-react';
import Status from './Status';
import { DELETE_LINK, UPDATE_LINK } from '../queries/ServerMutations';
import { enteredRequired, setActiveItem } from '../utils';
import { inputReducer } from '../InputReducer';

const EditLink = ( { activeItem, client, refetch } ) => {
	const { data: { Links } } = useQuery( GET_LOCAL_LINKS );
	const { label, type, x: { id: x_id }, y: { id: y_id }, story, optional } = Links.find( link => link.id === activeItem.itemId );
	const inputs = { required: { label, type, x_id, y_id }, props: { story: story ? story : '', optional } };

	const { data: { Nodes } } = useQuery( GET_LOCAL_NODES );
	let nodeOptions = Nodes.map( node => ({ 'text': node.label, 'value': node.id }) );
	if ( Nodes ) {
		nodeOptions = Nodes.map( node => ({ 'text': node.label, 'value': node.id }) );
	}
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
	const [ runDelete ] = useMutation( DELETE_LINK );

	const handleRequiredChange = ( e, data ) => {
		const name = data.name;
		const value = data.type === 'checkbox' ? data.checked : data.value;
		dispatch( { type: 'ADD_REQUIRED', name, value } );
	};

	const handlePropsChange = ( e, data ) => {
		const name = data.name;
		const value = data.type === 'checkbox' ? data.checked : data.value;
		dispatch( { type: 'ADD_PROPS', name, value } );
	};

	const handleSubmit = ( e ) => {
		e.preventDefault();
		if ( enteredRequired( store.required ) ) {
			// in this query all entries are optional as they can be edited or not
			// at some point I'll have to refactor this on the server side
			let props = { ...store.props, ...store.required };
			runUpdate( { variables: { id: activeItem.itemId, props } } )
				// timeout because otherwise the fetched data doesn't contain the new link (?)
				.then( setTimeout( function() {
					refetch();
				}, 100 ) )
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
			.then( data => setActiveItem( client, 'app', 'app' ) )
			.then( setTimeout( function() {
				refetch();
			}, 250 ) );
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
						onChange={ handleRequiredChange }
						required
						name='label'
						value={ store.required['label'] }
					/>
					<Form.Dropdown
						className='create-required-select create-input'
						fluid
						clearable
						search
						selection
						label='Type'
						options={ typeOptions }
						placeholder='Type'
						onChange={ handleRequiredChange }
						required
						name='type'
						value={ store.required['type'] }
					/>
					<Form.Dropdown
						placeholder='X-Node'
						fluid
						label='X-Node'
						clearable
						search
						selection
						required
						onChange={ handleRequiredChange }
						options={ nodeOptions }
						name='x_id'
						value={ store.required['x_id'] }
						className={ 'create-required-select create-input' }
					/>
					<Form.Dropdown
						fluid
						className='create-required-select create-input'
						label='Y-Node'
						placeholder='Y-Node'
						required
						clearable
						search
						selection
						onChange={ handleRequiredChange }
						options={ nodeOptions }
						name='y_id'
						value={ store.required['y_id'] }
					/>
					<Form.Input
						fluid
						className='create-required-input create-input'
						label='Story'
						placeholder='Story'
						onChange={ handlePropsChange }
						name='story'
						value={ store.props['story'] }
					/>
					<Form.Checkbox
						className='create-input'
						label='optional'
						onChange={ handlePropsChange }
						checked={ store.props['optional'] }
						name='optional'
					/>
				</Form.Group>
				<Form.Button onClick={ handleSubmit }>Update!</Form.Button>
				<Form.Button onClick={ handleDelete }>Delete</Form.Button>
			</Form>
			<Status data={ updateData } error={ updateError } loading={ updateLoading }/>
		</Container>
	);
};

export default EditLink;