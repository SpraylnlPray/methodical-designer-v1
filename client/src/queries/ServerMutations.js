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