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

function Create( fieldInfos ) {
	const fields = extractState( fieldInfos );
	const [ inputs, setInputs ] = useReducer(
		inputReducer,
		fields,
	);

	const [ createNode, { data, loading, error } ] = useMutation( CREATE_NODE );

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
	// fieldInfos contains objects with information about required and optional props
	let formElements = Object.keys( fieldInfos ).map( ( key, index1 ) => {
		// go over both and create the input element specified
		return fieldInfos[key].map( ( field, index2 ) => {
			let required = key === 'required';
			if ( field.type === 'text' ) {
				return (
					<Form.Input
						key={ index1 + '' + index2 }
						fluid
						label={ field.name }
						placeholder={ field.name }
						onChange={ handleChange }
						required={ required }
						name={ field.name }
						value={ inputs.required[field.name] }
					/>
				);
			}
			else if ( field.type === 'select' ) {
				return (
					<Form.Select
						key={ index1 + '' + index2 }
						fluid
						label='Type'
						options={ options }
						placeholder={ field.name }
						onChange={ handleChange }
						required={ required }
						name={ field.name }
						value={ inputs.required.type }
					/>
				);
			}
			else if ( field.type === 'checkbox' ) {
				return (
					<Form.Checkbox
						key={ index1 + '' + index2 }
						label={ field.name }
						onChange={ handleChange }
						checked={ inputs.props[field.name] }
						name={ field.name }
					/>
				);
			}
		} );
	} );

	return (
		<Container>
			<Header as='h2'>Create a Node</Header>
			<Form>
				<Form.Group widths='equal'>
					{ formElements }
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

// check if the user entered a value for the required fields
function enteredRequired( requiredFields ) {
	for ( let key of Object.keys( requiredFields ) ) {
		if ( requiredFields[key].length <= 0 ) {
			return false;
		}
	}
	return true;
}

// extract an object of structure {required: {name, init}, props: {name, init}} out of the
// information about input fields passed into the component
function extractState( fields ) {
	let required = {};
	let props = {};
	for ( let field of fields.required ) {
		required[field.name] = field.init;
	}
	for ( let field of fields.props ) {
		props[field.name] = field.init;
	}
	return { required, props };
}

export default Create;