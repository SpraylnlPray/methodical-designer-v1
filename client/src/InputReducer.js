export const inputReducer = ( state, action ) => {
	switch ( action.type ) {
		case 'ADD_REQUIRED':
			let { required } = state;
			required[action.name] = action.value;
			return { ...state, required };

		case 'ADD_PROPS':
			let { props } = state;
			props[action.name] = action.value;
			return { ...state, props };

		default:
			return state;
	}
};
