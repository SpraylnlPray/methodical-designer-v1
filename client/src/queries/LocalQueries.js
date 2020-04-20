import gql from 'graphql-tag';

export const GET_ACTIVE_ITEM = gql`
	{
		activeItem @client
	}
`;
