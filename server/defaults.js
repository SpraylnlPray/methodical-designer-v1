const defaultSeq = { group: 'None', seq: -1, label: 'None' };
const defaultLink = {
	id: '-1',
	label: 'None',
	from_id: '-1',
	to_id: '-1',
	type: 'None',
	story: 'None',
	sequence: defaultSeq,
	optional: false,
	synchronous: false,
	unreliable: false,
};
const defaultNode = {
	id: '-1',
	label: 'None',
	story: 'None',
	type: 'None',
};

module.exports = { defaultSeq, defaultLink, defaultNode };