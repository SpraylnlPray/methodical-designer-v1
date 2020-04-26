import React from 'react';
import { Container, Form, Header } from 'semantic-ui-react';
import withFormHandling from '../HOCs/withFormHandling';
import Status from './Status';
import { useMutation } from '@apollo/react-hooks';
import { enteredRequired, setJustFetched } from '../utils';

// inputs comes from the HOC managing the input and is the object that is saved in the state
// props.inputs is the whole object containing information about the type of input etc. for rendering
function CreateLink( { inputs, handleChange, props } ) {
	const [ runMutation, { data, loading, error } ] = useMutation( props.mutation );

	const handleSubmit = ( e ) => {
		e.preventDefault();
		if ( enteredRequired( inputs.required ) ) {
			runMutation( { variables: { ...inputs.required, props: inputs.props } } )
				.catch( e => console.log( e ) );
			console.log( 'setting just fetched to true in create node' );
			setJustFetched( props.client, true );
		}
		else {
			console.log( 'Must provide required inputs!' );
			alert( 'Must provide required inputs!' );
		}
	};

	return (
		<Container>
			<Header as='h2'>Create a Link!</Header>
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
						value={ inputs['label'] }
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
						value={ inputs['type'] }
					/>
					<Form.Input
						fluid
						className='create-required-input create-input'
						label='X-Node ID'
						placeholder='X-ID'
						onChange={ handleChange }
						name='x_id'
						value={ inputs['x_id'] }
					/>
					<Form.Input
						fluid
						className='create-required-input create-input'
						label='Y-Node ID'
						placeholder='Y-ID'
						onChange={ handleChange }
						name='y_id'
						value={ inputs['y_id'] }
					/>
					<Form.Input
						fluid
						className='create-required-input create-input'
						label='Story'
						placeholder='Story'
						onChange={ handleChange }
						name='story'
						value={ inputs['story'] }
					/>
					<Form.Checkbox
						className='create-input'
						label='optional'
						onChange={ handleChange }
						checked={ inputs['optional'] }
						name='optional'
					/>
				</Form.Group>
				<Form.Button onClick={ handleSubmit }>Create!</Form.Button>
			</Form>
			<Status data={ data } error={ error } loading={ loading }/>
		</Container>
	);
}

export default withFormHandling( CreateLink );
