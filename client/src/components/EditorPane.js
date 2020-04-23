import React from 'react';
import Graph from 'react-graph-vis';
import { setActiveItem } from '../utils';

const EditorPane = ( { client, nodeData, linkData, setMakeAppActive } ) => {
	let nodes = {};
	let links = {};
	if ( nodeData && nodeData.Nodes ) {
		nodes = nodeData.Nodes.map( node => ({ id: node.id, label: node.label }) );
	}
	if ( linkData && linkData.Links ) {
		links = linkData.Links.map( link => ({ id: link.id, from: link.x.id, to: link.y.id }) );
	}

	const graph = {
		nodes,
		edges: links,
	};

	const options = {
		layout: {
			improvedLayout: true,
		},
		edges: {
			color: '#000000',
			arrows: {
				to: { enabled: false },
				from: { enabled: false },
			},
		},
		height: '100%',
		autoResize: true,
		interaction: {
			hoverConnectedEdges: false,
			selectConnectedEdges: false,
		},
		physics: {
			enabled: false,
		},
	};

	const events = {
		selectNode: function( event ) {
			let { nodes } = event;
			setMakeAppActive( false );
			setActiveItem( client, nodes[0] );
		},
		selectEdge: function( event ) {
			let { edges } = event;
			setMakeAppActive( false );
			setActiveItem( client, edges[0] );
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