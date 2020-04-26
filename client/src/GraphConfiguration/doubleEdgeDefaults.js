import G6 from '@antv/g6';

const edgeTypeColorMap = {
	type1: [ '#531dab', '#391085', '#391085' ],
	type2: [ '#d9d9d9', '#bfbfbf', '#8c8c8c' ],
	type3: [ '#d3adf7', '#b37feb', '#9254de' ],
};

// from https://g6.antv.vision/en/docs/manual/FAQ/multi-line#gatsby-focus-wrapper with adaptions
export const doubleEdgeConf = {
	style: {
		lineAppendWidth: 5,
		lineDash: [ 0, 0 ],
		lineDashOffset: 0,
		opacity: 1,
		labelCfg: {
			style: {
				fillOpacity: 1,
			},
		},
	},

	drawShape( cfg, group ) {
		const item = group.get( 'item' );
		const shapeStyle = this.getShapeStyle( cfg, item );
		const shape = group.addShape( 'path', {
			className: 'edge-path',
			attrs: shapeStyle,
		} );
		return shape;
	},

	drawLabel( cfg, group ) {
		const labelCfg = cfg.labelCfg || {};
		const labelStyle = this.getLabelStyle( cfg, labelCfg, group );
		const text = group.addShape( 'text', {
			attrs: {
				...labelStyle,
				text: cfg.label,
				fontSize: 12,
				fill: '#404040',
				cursor: 'pointer',
			},
			className: 'edge-label',
		} );

		return text;
	},

	getShapeStyle( cfg, item ) {
		const { startPoint, endPoint } = cfg;
		const type = item.get( 'type' );

		const defaultStyle = this.getStateStyle( 'default', true, item );

		if ( type === 'node' ) {
			return Object.assign( {}, cfg.style, defaultStyle );
		}

		const controlPoints = this.getControlPoints( cfg );
		let points = [ startPoint ];

		if ( controlPoints ) {
			points = points.concat( controlPoints );
		}

		points.push( endPoint );
		const path = this.getPath( points );

		const style = Object.assign( {}, { path }, cfg.style, defaultStyle );
		return style;
	},

	getControlPoints( cfg ) {
		let controlPoints = cfg.controlPoints;

		if ( !controlPoints || !controlPoints.length ) {
			const { startPoint, endPoint } = cfg;
			const innerPoint = G6.Util.getControlPoint( startPoint, endPoint, 0.5, cfg.edgeOffset || 30 );
			controlPoints = [ innerPoint ];
		}
		return controlPoints;
	},

	getPath( points ) {
		const path = [];
		path.push( [ 'M', points[0].x, points[0].y ] );
		path.push( [ 'Q', points[1].x, points[1].y, points[2].x, points[2].y ] );
		return path;
	},

	getStateStyle( name, value, item ) {
		const model = item.getModel();
		const { style = {} } = model;

		const defaultStyle = Object.assign( {}, this.style );

		return {
			...defaultStyle,
			lineWidth: 1,
			stroke: edgeTypeColorMap[model.edgeType] && edgeTypeColorMap[model.edgeType][0],
			...style,
		};
	},
};