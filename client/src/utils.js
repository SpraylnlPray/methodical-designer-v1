import gql from "graphql-tag";

export const setActiveItem = (client, name) => {
	client.writeQuery( {
		query: gql`query {activeItem}`,
		data: { activeItem: name },
	} );
};