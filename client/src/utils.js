import gql from 'graphql-tag';

export const setActiveItem = ( client, name ) => {
	client.writeQuery( {
		query: gql`query {activeItem}`,
		data: { activeItem: name },
	} );
};

export const setJustFetched = ( client, value ) => {
	client.writeQuery( {
		query: gql`query {justFetched}`,
		data: { justFetched: value },
	} );
};

// check if the user entered a value for the required fields
export const enteredRequired = ( requiredFields ) => {
	for ( let key of Object.keys( requiredFields ) ) {
		if ( requiredFields[key].length <= 0 ) {
			return false;
		}
	}
	return true;
};