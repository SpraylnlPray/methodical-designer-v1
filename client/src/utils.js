import gql from 'graphql-tag';

export const setActiveItem = ( client, itemId, itemType ) => {
	client.writeQuery( {
		query: gql`
      mutation {
        activeItem {
          itemId
          itemType
        }
      }`,
		data: {
			activeItem: {
				itemId,
				itemType,
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