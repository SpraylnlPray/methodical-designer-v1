import React from 'react';
import { Container, Form, Header } from 'semantic-ui-react';
import withFormHandling from '../HOCs/withFormHandling';
import Status from './Status';

// inputs comes from the HOC managing the input and is the object that is saved in the state
// props.inputs is the whole object containing information about the type of input etc. for rendering
function Create( { inputs, data, loading, error, handleChange, handleSubmit, props } ) {

	// key contains information if field is required or not
	const formElements = Object.keys( props.inputs ).map( ( key, index1 ) => {
		return Object.keys( props.inputs[key] ).map( ( field, index2 ) => {
			let inputField = props.inputs[key][field];
			const required = key === 'required';
			if ( inputField.type === 'text' ) {
				return (
					<Form.Input
						key={ index1 + '' + index2 }
						fluid
						label={ inputField.label }
						placeholder={ inputField.label }
						onChange={ handleChange }
						required={ required }
						name={ inputField.name }
						value={ inputs[key][inputField.name] }
					/>
				);
			}
			else if ( inputField.type === 'select' ) {
				return (
					<Form.Select
						key={ index1 + '' + index2 }
						fluid
						label={ inputField.label }
						options={ inputField.options }
						placeholder={ inputField.label }
						onChange={ handleChange }
						required={ required }
						name={ inputField.name }
						value={ inputs[key][inputField.name] }
					/>
				);
			}
			else if ( inputField.type === 'checkbox' ) {
				return (
					<Form.Checkbox
						key={ index1 + '' + index2 }
						label={ inputField.label }
						onChange={ handleChange }
						checked={ inputs[key][inputField.name] }
						name={ inputField.name }
					/>
				);
			}
		} );
	} );

	return (
		<Container>
			<Header as='h2'>{ props.header }</Header>
			<Form>
				<Form.Group widths='equal'>
					{ formElements }

					{/*<Form.Input*/ }
					{/*	fluid*/ }
					{/*	label='Label'*/ }
					{/*	placeholder='Label'*/ }
					{/*	onChange={ handleChange }*/ }
					{/*	required*/ }
					{/*	name='label'*/ }
					{/*	value={ inputs.required.label }*/ }
					{/*/>*/ }
					{/*<Form.Select*/ }
					{/*	fluid*/ }
					{/*	label='Type'*/ }
					{/*	options={ options }*/ }
					{/*	placeholder='Type'*/ }
					{/*	onChange={ handleChange }*/ }
					{/*	required*/ }
					{/*	name='type'*/ }
					{/*	value={ inputs.required.type }*/ }
					{/*/>*/ }
					{/*<Form.Input*/ }
					{/*	fluid*/ }
					{/*	label='Story'*/ }
					{/*	placeholder='Story'*/ }
					{/*	onChange={ handleChange }*/ }
					{/*	name='story'*/ }
					{/*	value={ inputs.props.story }*/ }
					{/*/>*/ }
					{/*<Form.Checkbox label='Synchronous' onChange={ handleChange } name='synchronous'/>*/ }
					{/*<Form.Checkbox label='Unreliable' onChange={ handleChange } name='unreliable'/>*/ }
				</Form.Group>
				<Form.Button onClick={ handleSubmit }>Create!</Form.Button>
			</Form>
			<Status data={ data } error={ error } loading={ loading }/>
		</Container>
	);
}

export default withFormHandling( Create );
