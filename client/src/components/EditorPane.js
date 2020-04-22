import React from 'react';
import Graph from 'react-graph-vis';
import { setActiveItem } from '../utils';

// import './styles.css';
// need to import the vis network css in order to show tooltip
// import './network.css';

const EditorPane = ( { client, nodeData, linkData } ) => {
	let nodes = {};
	let links = {};
	if ( nodeData && nodeData.Nodes ) {
		nodes = nodeData.Nodes.map( node => ({ id: node.id, label: node.label }) );
	}
	if ( linkData && linkData.Links ) {
		links = linkData.Links.map( link => ({ from: link.x.id, to: link.y.id }) );
	}

	const graph = {
		nodes,
		edges: links,
	};

	const options = {
		layout: {
			hierarchical: true,
		},
		edges: {
			color: '#000000',
		},
		height: '100%',
	};

	const events = {
		select: function( event ) {
			let { nodes, edges } = event;
			// query local cache for node and set this as active item and pass node data to input pane
			// setActiveItem(client, )
			if ( nodes.length > 0 ) {
				event.setActiveItem = false;
				setActiveItem( client, nodes[0] );
			}
			else if ( edges.length > 0 ) {
				event.setActiveItem = false;
				setActiveItem( client, edges[0] );
			}
		},
	};

	return (
		<div className='bordered editor-pane margin-base'>
			<Graph
				graph={ graph }
				options={ options }
				events={ events }
				getNetwork={ network => {
					//  if you want access to vis.js network api you can set the state in a parent component using this property
				} }
			/>
		</div>
	);
};

export default EditorPane;