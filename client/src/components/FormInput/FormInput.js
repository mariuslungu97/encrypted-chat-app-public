import React from 'react'
import {Form} from 'react-bootstrap';

const FormInput = ({id, label, value, error, type, placeholder, name, handleChange, inputClass}) => (
    
    <Form.Group className={inputClass} controlId={id}>
        <Form.Label>{label}</Form.Label>
        <Form.Control value={value || ''}
                      isInvalid={error.length > 0 && value.length > 0 ? true : false} 
                      type={type} 
                      placeholder={placeholder} 
                      name={name} 
                      onChange={(e) => handleChange(e)}>
                        
        </Form.Control>
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
    
);

export default FormInput;