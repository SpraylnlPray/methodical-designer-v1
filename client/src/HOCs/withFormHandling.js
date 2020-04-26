import React, { useReducer } from 'react';

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
	return function( { ...props } ) {
		const [ store, dispatch ] = useReducer(
			inputReducer,
			{ ...props.inputs, justFetched: false },
		);

		const handleChange = ( e, data ) => {
			const name = data.name;
			const value = data.type === 'checkbox' ? data.checked : data.value;
			const required = !!data.required;
			dispatch( { type: 'ADD', required, name, value } );
		};

		return (
			<FormComponent
				props={ props }
				inputs={ store }
				handleChange={ handleChange }
			/>
		);
	};
};

export default withFormHandling;