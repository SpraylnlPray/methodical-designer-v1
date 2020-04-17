import React  from 'react';
import { Container, Form, Header } from 'semantic-ui-react';
import { CREATE_NODE } from '../queries/ServerMutations';
import withFormHandling from '../HOCs/withFormHandling';

const options = [
	{ text: 'API', value: 'API' },
	{ text: 'Event', value: 'Event' },
	{ text: 'Persistence', value: 'Persistence' },
	{ text: 'Abstract User Interface', value: 'AbstractUserInterface' },
];

function Create( { inputs, data, loading, error, handleChange, handleSubmit }  ) {
	return (
		<Container>
			<Header as='h2'>Create a Node</Header>
			<Form>
				<Form.Group widths='equal'>
					<Form.Input
						fluid
						label='Label'
						placeholder='Label'
						onChange={ handleChange }
						required
						name='label'
						value={ inputs.required.label }
					/>
					<Form.Select
						fluid
						label='Type'
						options={ options }
						placeholder='Type'
						onChange={ handleChange }
						required
						name='type'
						value={ inputs.required.type }
					/>
					<Form.Input
						fluid
						label='Story'
						placeholder='Story'
						onChange={ handleChange }
						name='story'
						value={ inputs.props.story }
					/>
					<Form.Checkbox label='Synchronous' onChange={ handleChange } name='synchronous'/>
					<Form.Checkbox label='Unreliable' onChange={ handleChange } name='unreliable'/>
				</Form.Group>
				<Form.Button onClick={ handleSubmit }>Create!</Form.Button>
			</Form>
			{ loading && <p>Loading...</p> }
			{ error && error.graphQLErrors.map( ( { message }, i ) => {
				return <span key={ i }>{ message }</span>;
			} ) }
			{ data && <p>Created Node { data.CreateNode.node.label }</p> }
		</Container>
	);
}

const fields = {
	required: { label: '', type: '' },
	props: { story: '', synchronous: false, unreliable: false },
};

export default withFormHandling( Create, fields, CREATE_NODE );