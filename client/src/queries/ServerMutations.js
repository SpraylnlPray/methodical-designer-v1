import gql from 'graphql-tag';

export const CREATE_NODE = gql`
  mutation($id: ID!, $label: String!, $type: NodeType!, $props: NodeCreateInput){
    CreateNode(id: $id, label: $label, type: $type, props: $props) {
      success
      message
      node {
        id
        label
        type
        story
        synchronous
        unreliable
      }
		}
	}
`;

export const CREATE_LINK = gql`
	mutation($label: String!, $type: LinkType!, $x_id: ID!, $y_id: ID! $props: LinkCreateInput){
		CreateLink(label: $label, type: $type, x_id: $x_id, y_id: $y_id, props: $props){
			success
			message
			link {
        id
        label
        type
        story
        optional
			}
		}
	}
`;

export const UPDATE_NODE = gql`
	mutation($id: ID!, $props: NodeInput) {
		UpdateNode(id: $id, props: $props) {
      success
      message
      node {
        id
        label
        type
        story
        synchronous
        unreliable
      }
		}
	}
`;

export const UPDATE_LINK = gql`
	mutation($id: ID!, $props: LinkInput) {
		UpdateLink(id: $id, props: $props) {
      success
      message
      link {
        id
        label
        type
        story
        optional
      }
		}
	}
`;

export const DELETE_NODE = gql`
  mutation($id: ID!) {
    DeleteNode(id: $id) {
      success
      id
    }
  }
`;

export const DELETE_LINK = gql`
  mutation($id: ID!) {
    DeleteLink(id: $id) {
      success
      id
    }
  }
`;

export const CREATE_LINK_END = gql`
  mutation($id: ID!, $props: LinkEndInput) {
    CreateLinkEnd(link_id: $id, props: $props) {
      success
      message
      end {
        note
        arrow
      }
    }
  }
`;

export const CREATE_SEQUENCE = gql`
  mutation($id: ID!, $props: SequencePropertyInput) {
    CreateSequence(link_id: $id, props: $props) {
      message
      success
      seq {
        group
        seq
      }
    }
  }
`;