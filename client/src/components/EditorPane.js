import React from 'react';
import { setActiveItem } from '../utils';
import G6 from '@antv/g6';
import ReactDOM from 'react-dom';

const { useEffect } = require( 'react' );

const EditorPane = ( { client, nodeData, linkData, setMakeAppActive } ) => {
	let nodes = [];
	let links = [];
	if ( nodeData && nodeData.Nodes ) {
		nodes = nodeData.Nodes.map( node => ({ id: node.id, label: node.label }) );
	}
	if ( linkData && linkData.Links ) {
		links = linkData.Links.map( link => ({ id: link.id, source: link.x.id, target: link.y.id }) );
	}

	const data = {
		nodes,
		edges: links,
	};

	const ref = React.useRef( null );
	let graph = null;

	// todo: use reducer in app to tell graph to rerender when new data is there
	useEffect( () => {
		if ( !graph ) {
			graph = new G6.Graph( {
				container: ReactDOM.findDOMNode( ref.current ),
				width: 1200,
				height: 800,
				modes: {
					default: [ { type: 'drag-canvas' }, { type: 'drag-node' }, { type: 'zoom-canvas' } ],
				},
				layout: {
					type: 'dagre',
				},
				defaultNode: {
					type: 'node',
					size: 40,
					labelCfg: {
						style: {
							fill: '#000000A6',
							fontSize: 12,
						},
					},
					style: {
						stroke: '#72CC4A',
						width: 150,
					},
				},
				defaultEdge: {
					type: 'quadratic',
					size: 5,
					style: {
						stroke: '#e2e2e2',
					},
				},
			} );
		}

		// example here: https://g6.antv.vision/en/docs/manual/middle/g6InReact
		graph.on( 'node:click', e => {
			const { item } = e;
			const { defaultCfg } = item;
			setActiveItem( client, defaultCfg.id );
			setMakeAppActive( false );
		} );

		graph.on( 'edge:click', e => {
			const { item } = e;
			const { defaultCfg } = item;
			setActiveItem( client, defaultCfg.id );
			setMakeAppActive( false );
		} );

		graph.data( data );
		graph.render();
	}, [] );

	return (
		<div className='bordered editor-pane margin-base'>
			<div ref={ ref }/>
		</div>
	);
};

export default EditorPane;