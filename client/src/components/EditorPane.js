import React, { Component } from 'react';
import Graph from 'react-graph-vis';

let ctx;
let network;
let container;
let canvas;
let nodes;
let rect = [];
let drag = false;
var drawingSurfaceImageData;

class EditorPane extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			drag: false,
			height: '100%',
			options: {
				layout: {
					improvedLayout: true,
				},
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
				nodes: [
					{
						id: 1,
						label: 'Node 1',
					},
					{
						id: 2,
						label: 'Node 2',
					},
					{
						id: 3,
						label: 'Node 3',
					},
					{
						id: 4,
						label: 'Node 4',
					},
					{
						id: 5,
						label: 'Node 5',
					},
				],
				edges: [
					{
						from: 1,
						to: 2,
						arrows: 'to',
						smooth: { type: 'curvedCCW', roundness: 0.5 },
					},
					{
						from: 1,
						to: 2,
						arrows: 'to',
						smooth: { type: 'curvedCCW', roundness: 0.2 },
					},
					{
						from: 2,
						to: 1,
						arrows: 'to',
						smooth: { type: 'curvedCCW', roundness: 0.3 },
					},
					{
						from: 2,
						to: 1,
						arrows: 'to',
						smooth: { type: 'curvedCCW', roundness: 0.1 },
					},
					{
						from: 1,
						to: 3,
					},
					{
						from: 2,
						to: 4,
					},
					{
						from: 2,
						to: 5,
					},
				],
			},
		};
		this.canvasWrapperRef = React.createRef();
	}

	componentDidMount() {
		// ref on graph <Graph/> to add listeners to, maybe?
		console.log( 'ref:', this.canvasWrapperRef.current.Network.body.nodes );

		container = this.canvasWrapperRef.current.Network.canvas.frame;
		network = this.canvasWrapperRef.current.Network;
		canvas = this.canvasWrapperRef.current.Network.canvas.frame.canvas;
		nodes = this.state.graph.nodes;
		ctx = canvas.getContext( '2d' );

		container.oncontextmenu = function() {
			return false;
		};
	}

	render() {
		return (
			<div className='bordered editor-pane margin-base'>
				<Graph
					ref={ this.canvasWrapperRef }
					graph={ this.state.graph }
					options={ this.state.options }
					events={ this.events }
				/>
			</div>
		);
	}
}

export default EditorPane;
