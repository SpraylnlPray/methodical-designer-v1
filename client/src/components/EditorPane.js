import React from 'react';
import Graph from 'react-graph-vis';
import { setActiveItem } from '../utils';

const EditorPane = ( { client, nodeData, linkData, setMakeAppActive } ) => {
	let nodes = nodeData.Nodes.map( node => ({ id: node.id, label: node.label }) );
	let links = createLinks( linkData.Links ) || [];

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
				type: 'horizontal',
				roundness: 0,
			},
			font: {
				size: 12,
				align: 'middle',
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

const createLinkDict = links => {
	let dict = {};
	links.forEach( link => {
		link.added = false;
		dict[link.id] = link;
	} );
	return dict;
};

const createLinks = links => {
	const multipleConnectionsList = [];
	const normalLinks = [];
	const linkDict = createLinkDict( links );
	// go over each link
	for ( let key in linkDict ) {
		const multipleLinks = [];
		let link = linkDict[key];
		// if the link has not been checked yet
		if ( !link.added ) {
			// get all links that are not the link itself
			const linksToCheck = links.filter( checkLink => checkLink.id !== link.id );
			linksToCheck.forEach( linkToCheck => {
					// if link to check link hasn't been added yet
					if ( !linkToCheck.added ) {
						// if both are connected to the same nodes
						if ( haveSameNodes( link, linkToCheck ) ) {
							// and the link itself has not been checked yet
							if ( !link.added ) {
								// add both to the temporary array and mark them as checked
								multipleLinks.push( link, linkToCheck );
								link.added = true;
							}
							else {
								// otherwise add just the checked link to the temp array
								multipleLinks.push( linkToCheck );
							}
							linkDict[linkToCheck.id].added = true;
						}
					}
				},
			);
			// if, after comparing with all other links, it hasn't been added yet, it is a normal link so add and mark it
			if ( !link.added ) {
				normalLinks.push( link );
				link.added = true;
			}
			// if, however, there were links found that share both nodes, we need to save them
			if ( multipleLinks.length > 0 ) {
				multipleConnectionsList.push( multipleLinks );
			}
		}
	}

	const normalLinkData = normalLinks.map( link => ({
		id: link.id,
		from: link.x.id,
		to: link.y.id,
		label: link.label,
	}) );

	const stepSize = 0.3;
	const multipleLinkData = multipleConnectionsList.map( list => {
		return list.map( ( link, index ) => {
			// todo: check if I can use negative values for roundness
			return {
				id: link.id,
				from: link.x.id,
				to: link.y.id,
				label: link.label,
				smooth: { roundness: index * stepSize },
			};
		} );
	} );

	let multipleLinkDisplayData = [];
	multipleLinkData.forEach( list => {
		multipleLinkDisplayData.push( ...list );
	} );

	return multipleLinkDisplayData.concat( normalLinkData );

};

const haveSameNodes = ( link1, link2 ) => {
	return link1.x.id === link2.x.id && link1.y.id === link2.y.id ||
		link1.y.id === link2.x.id && link1.x.id === link2.y.id;
};