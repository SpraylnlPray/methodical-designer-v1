import gql from 'graphql-tag';

export const setActiveItem = ( client, id, objectType ) => {
	client.writeQuery( {
		query: gql`
      mutation {
        activeItem {
          id
          objectType
        }
      }`,
		data: {
			activeItem: {
				id,
				objectType,
				__typename: 'ActiveItem',
			},
		},
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