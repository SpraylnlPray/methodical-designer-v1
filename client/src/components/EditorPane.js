import React, { Component } from 'react';
import Graph from 'react-graph-vis';

class EditorPane extends Component {
	constructor( props ) {
		super( props );
		console.log( 'in constructor' );
		this.state = {
			drag: false,
			options: {
				layout: {
					improvedLayout: true,
				},
				height: '100%',
				edges: {
					smooth: true,
					arrows: {
						to: { enabled: false },
						from: { enabled: false },
					},
				},
				physics: {
					enabled: false,
				},
				interaction: {
					dragView: true,
					hoverConnectedEdges: false,
					selectConnectedEdges: false,
				},
			},
			graph: {
				nodes: props.nodeData.Nodes.map( node => ({ id: node.id, label: node.label }) ),
				edges: createLinks( props.linkData.Links ),
			},
		};
	}

	render() {
		return (
			<div className='bordered editor-pane margin-base'>
				<Graph
					graph={ this.state.graph }
					options={ this.state.options }
					events={ this.events }
				/>
			</div>
		);
	}
}

export default EditorPane;

const createLinks = links => {
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