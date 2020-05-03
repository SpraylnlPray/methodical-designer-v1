import gql from 'graphql-tag';

export const ACTIVE_ITEM = gql`
  query {
    activeItem @client {
      itemId
      itemType
    }
  }
`;

export const LOCAL_NODES = gql`
  query {
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

export const DELETED_NODE_IDS = gql`
  query {
    deletedNodes @client {
      id
    }
  }
`;

export const LOCAL_LINKS = gql`
  query {
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
      x_end {
        arrow
        note
      }
      y_end {
        arrow
        note
      }
      sequence {
        group
        seq
      }
    }
  }
`;