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
		default:
			return state;
	}
};

const withFormHandling = ( FormComponent ) => {
	return function( {fields, mutation} ) {
		const [ inputs, setInputs ] = useReducer(
			inputReducer,
			fields,
		);

		const [ runMutation, { data, loading, error } ] = useMutation( mutation );

		const handleChange = ( e, data ) => {
			const name = data.name;
			const value = data.type === 'checkbox' ? data.checked : data.value;
			const required = !!data.required;
			setInputs( { type: 'ADD', required, name, value } );
		};

		const handleSubmit = ( e ) => {
			e.preventDefault();
			if ( enteredRequired( inputs.required ) ) {
				runMutation( { variables: { ...inputs.required, props: inputs.props } } )
					.catch( e => console.log( e ) );
			}
			else {
				console.log( 'Must provide label and type!' );
				alert( 'Must provide label and type!' );
			}
		};

		return (
			<FormComponent
				inputs={ inputs }
				data={ data }
				loading={ loading }
				error={ error }
				handleChange={ handleChange }
				handleSubmit={ handleSubmit }
			/>
		);
	};
};

function enteredRequired( requiredFields ) {
	for ( let key of Object.keys( requiredFields ) ) {
		if ( requiredFields[key].length <= 0 ) {
			return false;
		}
	}
	return true;
}

export default withFormHandling;