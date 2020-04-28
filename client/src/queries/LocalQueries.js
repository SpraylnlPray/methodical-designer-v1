import gql from 'graphql-tag';

export const GET_ACTIVE_ITEM = gql`
  {
    activeItem @client {
      itemId
      itemType
    }
  }
`;

export const GET_LOCAL_NODES = gql`
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

export const GET_LOCAL_LINKS = gql`
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