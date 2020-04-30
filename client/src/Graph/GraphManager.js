export default class GraphManager {
	#nodes = {};
	#links = {};
	#options = {
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
	#linkDict = {};

	constructor( nodes, links ) {
		this.#nodes = nodes;
		this.#links = links;
		this.#linkDict = this.createLinkDict();
	}

	get graphOptions() {
		return this.#options;
	}

	get nodeDisplayData() {
		return this.#nodes.map( node => ({ id: node.id, label: node.label }) );
	}

	get linkDisplayData() {
		const linkDisplayData = this.createLinks( this.#linkDict );
		return linkDisplayData;
	}

	createLinkDict() {
		let dict = {};
		this.#links.forEach( link => {
			link.added = false;
			dict[link.id] = link;
		} );
		return dict;
	};

	createLinks() {
		const multipleConnectionsList = [];
		const normalLinks = [];
		// go over each link
		for ( let key in this.#linkDict ) {
			const similarLinks = [];
			let link = this.#linkDict[key];
			// if the link has not been checked yet
			if ( !link.added ) {
				// get all links that are not the link itself
				const linksToCheck = this.#links.filter( checkLink => checkLink.id !== link.id );
				linksToCheck.forEach( linkToCheck => {
						// if link to check link hasn't been added yet
						if ( !linkToCheck.added ) {
							// if both are connected to the same nodes
							if ( this.haveSameNodes( link, linkToCheck ) ) {
								this.saveDoubleLink( link, linkToCheck, similarLinks );
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
				if ( similarLinks.length > 0 ) {
					multipleConnectionsList.push( similarLinks );
				}
			}
		}

		const normalLinkData = normalLinks.map( link => {
			const defaultData = this.getDefaultLinkData( link );
			return {
				...defaultData,
			};
		} );

		const multipleLinkData = this.normalizeMultipleConnections( multipleConnectionsList );

		return multipleLinkData.concat( normalLinkData );
	};

	normalizeMultipleConnections = multipleConnectionsList => {
		multipleConnectionsList = multipleConnectionsList.map( list => {
			return list.map( ( link, index ) => {
				const defaultData = this.getDefaultLinkData( link );
				return {
					...defaultData,
					smooth: { roundness: index / list.length },
				};
			} );
		} );

		let multipleLinkDisplayData = [];
		multipleConnectionsList.forEach( list => {
			multipleLinkDisplayData.push( ...list );
		} );
		return multipleLinkDisplayData;
	};

	getDefaultLinkData = link => {
		const { id, x: { id: from }, y: { id: to }, label } = link;
		return { id, from, to, label };
	};

	haveSameNodes = ( link1, link2 ) => {
		return link1.x.id === link2.x.id && link1.y.id === link2.y.id ||
			link1.y.id === link2.x.id && link1.x.id === link2.y.id;
	};

	saveDoubleLink = ( link1, link2, similarLinks ) => {
		// and the link itself has not been checked yet
		if ( !link1.added ) {
			// add both to the temporary array and mark them as checked
			similarLinks.push( link1, link2 );
			link1.added = true;
		}
		else {
			// otherwise add just the checked link to the temp array
			similarLinks.push( link2 );
		}
		this.#linkDict[link2.id].added = true;
	};
}
