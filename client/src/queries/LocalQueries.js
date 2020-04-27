import gql from 'graphql-tag';

export const GET_ACTIVE_ITEM = gql`
  {
    activeItem @client {
      id
      objectType
    }
  }
`;

export const GET_NODES = gql`
  {
    Nodes @client {
      id
      label
      type
      story
      synchronous
      unreliable
    }
  }
`;

export const GET_LINKS = gql`
  {
    Links @client {
      id
      label
      type
      story
      optional
      x {
        id
      }
      y {
        id
      }
    }
  }
`;