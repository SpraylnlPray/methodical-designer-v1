import React from 'react';
import { setActiveItem } from '../utils';
import G6 from '@antv/g6';
import ReactDOM from 'react-dom';
import { doubleEdgeConf } from '../GraphConfiguration/doubleEdgeDefaults';

const { useEffect } = require( 'react' );

const EditorPane = ( { client, nodeData, linkData, setMakeAppActive } ) => {
	let nodes = [];
	let links = [];
	if ( nodeData?.Nodes ) {
		nodes = nodeData.Nodes.map( node => ({ id: node.id, label: node.label }) );
	}
	if ( linkData?.Links ) {
		links = createLinks( linkData.Links );
	}

	let containerRef = React.useRef( null );
	let graph = null;

	useEffect( () => {
		if ( !graph ) {
			G6.registerEdge( 'quadratic-label-edge', doubleEdgeConf, 'quadratic' );
			graph = new G6.Graph( {
				container: ReactDOM.findDOMNode( containerRef.current ),
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
					type: 'quadratic-label-edge',
					size: 3,
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

		let data = {
			nodes,
			edges: links,
		};

		graph.data( data );
		graph.render();
	}, [] );

	return (
		<div className='bordered editor-pane margin-base'>
			<div ref={ containerRef }/>
		</div>
	);
};

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
		source: link.x.id,
		target: link.y.id,
		edgeType: 'type2',
		edgeOffset: Math.floor( Math.random() * 20 ) + 1,
	}) );
	links = links.map( link => ({
		id: link.id, source: link.x.id, target: link.y.id, edgeType: 'type2',
	}) );
	return multipleLinks.concat( links );
};

const areSameNodes = ( thisX, thisY, testX, testY ) => {
	return thisX.id === testX.id && thisY.id === testY.id ||
		thisX.id === testY.id && thisY.id === testX.id;
};