import React from 'react';
import Graph from 'react-graph-vis';
import { setActiveItem } from '../utils';

const EditorPane = ( { client, nodeData, linkData, setMakeAppActive } ) => {
	let nodes = nodeData.Nodes.map( node => ({ id: node.id, label: node.label }) );
	let links = createLinks( linkData.Links );

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
			physics: true,
			smooth: {
				enabled: true,
				type: 'straightCross',
				roundness: 0.5,
			},
			arrows: {
				to: { enabled: false },
				from: { enabled: false },
			},
		},
		nodes: {
			physics: false,
		},
		height: '100%',
		autoResize: true,
		interaction: {
			hoverConnectedEdges: false,
			selectConnectedEdges: false,
		},
		physics: {
			enabled: true,
		},
	};

	const events = {
		selectNode: function( event ) {
			let { nodes } = event;
			setMakeAppActive( false );
			setActiveItem( client, nodes[0], 'node' );
		},
		selectEdge: function( event ) {
			let { edges } = event;
			setMakeAppActive( false );
			setActiveItem( client, edges[0], 'link' );
		},
	};

	return (
		<div className='bordered editor-pane margin-base'>
			<Graph
				graph={ graph }
				options={ options }
				events={ events }
			/>
		</div>
	);
};

export default EditorPane;

const createLinks = links => {
	// todo: handling for more than 2 edges
	// todo: remove random roundness
	let multipleLinks = [];
	for ( let i = 0; i < links.length; i++ ) {
		const { x: thisX, y: thisY } = links[i];
		for ( let j = 0; j < links.length; j++ ) {
			if ( i !== j ) {
				const { x: testX, y: testY } = links[j];
				if ( areSameNodes( thisX, thisY, testX, testY ) ) {
					multipleLinks.push( links[i] );
				}
			}
		}
	}
	links = links.filter( link => !multipleLinks.some( compareLink => link.id === compareLink.id ) );
	multipleLinks = multipleLinks.map( link => ({
		id: link.id,
		from: link.x.id,
		to: link.y.id,
		smooth: { type: 'straightCross', roundness: (Math.random()).toFixed( 2 ) },
	}) );
	links = links.map( link => ({
		id: link.id, from: link.x.id, to: link.y.id,
	}) );
	return multipleLinks.concat( links );
};

const areSameNodes = ( thisX, thisY, testX, testY ) => {
	return thisX.id === testX.id && thisY.id === testY.id ||
		thisX.id === testY.id && thisY.id === testX.id;
};