import React, { useReducer } from 'react';
import { useMutation } from '@apollo/react-hooks';

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
		case 'RESET':
			break;
		default:
			return state;
	}
};

const withFormHandling = ( FormComponent ) => {
	return function( { mutation, ...props } ) {
		const fields = extractState( props.inputs );
		const [ state, setState ] = useReducer(
			inputReducer,
			{ ...fields, justFetched: false },
		);

		const [ runMutation, { data, loading, error } ] = useMutation( mutation );

		const handleChange = ( e, data ) => {
			const name = data.name;
			const value = data.type === 'checkbox' ? data.checked : data.value;
			const required = !!data.required;
			setState( { type: 'ADD', required, name, value } );
		};

		const handleSubmit = ( e ) => {
			e.preventDefault();
			if ( enteredRequired( state.required ) ) {
				state.justFetched = true;
				runMutation( { variables: { ...state.required, props: state.props } } )
					.catch( e => console.log( e ) );
			}
			else {
				console.log( 'Must provide required inputs!' );
				alert( 'Must provide required inputs!' );
			}
		};

		if ( data && state.justFetched ) {
			props.refetch();
		}

		return (
			<FormComponent
				props={ props }
				inputs={ state }
				data={ data }
				loading={ loading }
				error={ error }
				handleChange={ handleChange }
				handleSubmit={ handleSubmit }
			/>
		);
	};
};

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
	for ( let field of Object.keys( fields.required ) ) {
		required[field] = fields.required[field].init;
	}
	for ( let field of Object.keys( fields.props ) ) {
		props[field] = fields.props[field].init;
	}
	return { required, props };
}

export default withFormHandling;