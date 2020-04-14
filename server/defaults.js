const defaultSeq = {
	group: 'None',
	seq: -1,
	label: 'None',
	synchronous: false,
	unreliable: false,
};
const defaultLink = {
	id: '-1',
	label: 'None',
	from_id: '-1',
	to_id: '-1',
	type: 'None',
	story: 'None',
	sequence: defaultSeq,
	optional: false,

};
const defaultNode = {
	id: '-1',
	label: 'None',
	story: 'None',
	type: 'None',
};
const defaultLinkEnd = { note: 'None', arrow: 'default' };

module.exports = { defaultSeq, defaultLink, defaultNode, defaultLinkEnd };