import React, { useReducer } from 'react';
import { Container, Form, Header } from 'semantic-ui-react';
import Status from './Status';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { CREATE_LINK, CREATE_LINK_END } from '../queries/ServerMutations';
import { enteredRequired } from '../utils';
import { GET_LOCAL_NODES } from '../queries/LocalQueries';

const inputReducer = ( state, action ) => {
	switch ( action.type ) {

		case 'ADD_REQUIRED':
			let { required } = state;
			required[action.name] = action.value;
			return { ...state, required };

		case 'ADD_PROPS':
			let { props } = state;
			props[action.name] = action.value;
			return { ...state, props };

		case 'ADD_X_END':
			let { x_end } = state;
			x_end[action.name] = action.value;
			return { ...state, x_end };

		case 'ADD_Y_END':
			let { y_end } = state;
			y_end[action.name] = action.value;
			return { ...state, y_end };

		default:
			return state;
	}
};

function CreateLink( props ) {

	const inputs = {
		required: { label: '', type: '', x_id: '', y_id: '' },
		props: { story: '', optional: false },
		x_end: { arrow: '', note: '' },
		y_end: { arrow: '', note: '' },
	};
	const { data: { Nodes } } = useQuery( GET_LOCAL_NODES );
	const nodeOptions = Nodes.map( node => ({ 'text': node.label, 'value': node.id }) );
	const typeOptions = [
		{ 'text': 'Part Of', 'value': 'PartOf' },
		{ 'text': 'Trigger', 'value': 'Trigger' },
		{ 'text': 'Read', 'value': 'Read' },
		{ 'text': 'Mutate', 'value': 'Mutate' },
		{ 'text': 'Generic', 'value': 'Generic' },
	];
	const arrowOptions = [
		{ 'text': 'Default', 'value': 'default' },
	];

	const [ store, dispatch ] = useReducer(
		inputReducer,
		{ ...inputs },
	);

	// update function doesn't work here because somehow the returned link doesn't have x and y (?)
	const [ runCreateLink, { data, loading, error } ] = useMutation( CREATE_LINK );
	const [ runCreateEnd ] = useMutation( CREATE_LINK_END );

	const handleEndChange = ( e, data ) => {
		const name = data.name;
		const value = data.value;
		if ( data.placeholder.toLowerCase().includes( 'x' ) ) {
			dispatch( { type: 'ADD_X_END', name, value } );
		}
		else if ( data.placeholder.toLowerCase().includes( 'y' ) ) {
			dispatch( { type: 'ADD_Y_END', name, value } );
		}
	};

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
			runCreateLink( { variables: { ...store.required, props: store.props } } )
				.then( data => {
					const { data: { CreateLink: { link: { id } } } } = data;
					if ( store.x_end.arrow.length > 0 || store.x_end.note.length > 0 ) {
						runCreateEnd( { variables: { id: id, props: { ...store.x_end, xy: 'x' } } } );
					}
					if ( store.y_end.arrow.length > 0 || store.y_end.note.length > 0 ) {
						runCreateEnd( { variables: { id: id, props: { ...store.x_end, xy: 'y' } } } );
					}
				} )
				// timeout because otherwise the fetched data doesn't contain the new link (?)
				.then( setTimeout( function() {
					props.refetch();
				}, 400 ) )
				.catch( e => console.log( e ) );
		}
		else {
			console.log( 'Must provide required inputs!' );
			alert( 'Must provide required inputs!' );
		}
	};

	return (
		<Container>
			<Header as='h2'>Create a Link!</Header>
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
						fluid
						clearable
						search
						selection
						className='create-required-select create-input'
						label='X-Node'
						placeholder='X-Node'
						required
						onChange={ handleRequiredChange }
						options={ nodeOptions }
						name='x_id'
						value={ store.required['x_id'] }
					/>
					<Form.Dropdown
						fluid
						clearable
						search
						selection
						className='create-required-select create-input'
						label='X-Arrow'
						placeholder='X-Arrow'
						name='arrow'
						value={ store.x_end['arrow'] }
						options={ arrowOptions }
						onChange={ handleEndChange }
					/>
					<Form.Input
						fluid
						className='create-required-select create-input'
						label='X-Note'
						placeholder='X-Note'
						onChange={ handleEndChange }
						name='note'
						value={ store.x_end['note'] }
					/>
					<Form.Dropdown
						fluid
						clearable
						search
						selection
						className='create-required-select create-input'
						label='Y-Node'
						placeholder='Y-Node'
						required
						onChange={ handleRequiredChange }
						options={ nodeOptions }
						name='y_id'
						value={ store.required['y_id'] }
					/>
					<Form.Dropdown
						fluid
						clearable
						search
						selection
						className='create-required-select create-input'
						label='Y-Arrow'
						placeholder='Y-Arrow'
						name='arrow'
						value={ store.y_end['arrow'] }
						options={ arrowOptions }
						onChange={ handleEndChange }
					/>
					<Form.Input
						fluid
						className='create-required-select create-input'
						label='Y-Note'
						placeholder='Y-Note'
						onChange={ handleEndChange }
						name='note'
						value={ store.y_end['note'] }
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
				<Form.Button onClick={ handleSubmit }>Create!</Form.Button>
			</Form>
			<Status data={ data } error={ error } loading={ loading }/>
		</Container>
	);
}

export default CreateLink;
