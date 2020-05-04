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

export const LOCAL_NODES_TAG = gql`
  query {
    Nodes @client {
      id
      label
      type
      story
      synchronous
      unreliable
      localNode
    }
  }
`;

export const DELETED_NODES = gql`
  query {
    deletedNodes @client {
      id
    }
  }
`;

export const DELETED_LINKS = gql`
  query {
    deletedLinks @client {
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