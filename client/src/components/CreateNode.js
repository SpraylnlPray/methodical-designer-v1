import React from 'react';
import { Container, Form, Header } from 'semantic-ui-react';
import withFormHandling from '../HOCs/withFormHandling';
import Status from './Status';

// inputs comes from the HOC managing the input and is the object that is saved in the state
// props.inputs is the whole object containing information about the type of input etc. for rendering
function CreateNode( { store, data, error, loading, handleSubmit, handleChange, props } ) {
	return (
		<Container>
			<Header as='h2'>Create a Node!</Header>
			<Form className='create-form'>
				<Form.Group className='create-group'>
					<Form.Input
						fluid
						className='create-required-input create-input'
						label='Label'
						placeholder='Label'
						onChange={ handleChange }
						required
						name='label'
						value={ store['label'] }
					/>
					<Form.Select
						className='create-required-select create-input'
						fluid
						label='Type'
						options={ props.typeOptions }
						placeholder='Type'
						onChange={ handleChange }
						required
						name='type'
						value={ store['type'] }
					/>
					<Form.Input
						fluid
						className='create-required-input create-input'
						label='Story'
						placeholder='Story'
						onChange={ handleChange }
						name='story'
						value={ store['story'] }
					/>
					<Form.Checkbox
						className='create-input'
						label='Synchronous'
						onChange={ handleChange }
						checked={ store['synchronous'] }
						name='synchronous'
					/>
					<Form.Checkbox
						className='create-input'
						label='Unreliable'
						onChange={ handleChange }
						checked={ store['unreliable'] }
						name='unreliable'
					/>
				</Form.Group>
				<Form.Button onClick={ handleSubmit }>Create!</Form.Button>
			</Form>
			<Status data={ data } error={ error } loading={ loading }/>
		</Container>
	);
}

export default withFormHandling( CreateNode );
