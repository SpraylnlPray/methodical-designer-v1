import gql from 'graphql-tag';

export const GET_SERVER_NODES = gql`
	query nodes{
		Nodes{
      id
      label
      type
      story
      synchronous
      unreliable      
		}
	}
`;

export const GET_SERVER_LINKS = gql`
  query links {
    Links {
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