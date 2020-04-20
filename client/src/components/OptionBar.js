import React from 'react';
import { Button } from 'semantic-ui-react';

const OptionBar = props => {
	return (
		<div className='bordered margin-base'>
			<Button>Create Node</Button>
			<Button>Create Link</Button>
		</div>
	);
};

export default OptionBar;