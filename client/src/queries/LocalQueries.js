import gql from 'graphql-tag';

export const GET_ACTIVE_ITEM = gql`
	{
		activeItem @client
	}
`;

export const GET_LOCAL_NODES = gql`
	query {
		nodes @client
	}
`;