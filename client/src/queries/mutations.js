import gql from 'graphql-tag';

export const CREATE_NODE = gql`
	mutation($label: String!, $type: NodeType!, $props: NodeCreateInput){
		CreateNode(label: $label, type: $type, props: $props) {
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