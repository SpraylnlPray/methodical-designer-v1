import gql from 'graphql-tag';

export const GET_ACTIVE_ITEM = gql`
  query { activeItem @client }
`;

export const GET_JUST_FETCHED = gql`
  query { justFetched @client }
`;