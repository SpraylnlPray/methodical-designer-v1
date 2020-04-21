import React from 'react';
import Graph from 'react-graph-vis';

// import './styles.css';
// need to import the vis network css in order to show tooltip
// import './network.css';

const EditorPane = ( props ) => {

	const graph = {
		nodes: [
			{ id: 1, label: 'Node 1', title: 'node 1 tooltip text' },
			{ id: 2, label: 'Node 2', title: 'node 2 tooltip text' },
			{ id: 3, label: 'Node 3', title: 'node 3 tooltip text' },
			{ id: 4, label: 'Node 4', title: 'node 4 tooltip text' },
			{ id: 5, label: 'Node 5', title: 'node 5 tooltip text' },
		],
		edges: [
			{ from: 1, to: 2 },
			{ from: 1, to: 3 },
			{ from: 2, to: 4 },
			{ from: 2, to: 5 },
		],
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