import React, {Component} from 'react';
import {Form, Button} from 'react-bootstrap';
import {Link, withRouter} from 'react-router-dom';
import FormInput from '../../FormInput/FormInput';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email : null,
            password : null,
            formErrors : {
                email : '',
                password : ''
            },
            inputTypes : {
                email : {id : 'authLoginEmail', name : 'email', label : 'Email Address', type : 'email', placeholder : 'Enter your mail...', handleChange : this.handleChange},
                password : {id : 'authLoginPass', name : 'password', label : 'Password: ', type : 'password', placeholder : 'Enter your password...', handleChange : this.handleChange}
            }
        };
        
    }
    
    //check form validation
    handleChange = e => {
        const {name, value} = e.target;

        this.setState({
            [name] : value
        });
    };

    render() {
        
        return (
            <Form onSubmit={(e) => this.props.handleLogin(e,this.state.email, this.state.password)}>
                <p className="lead my-4">Login:</p>

                <FormInput {...this.state.inputTypes.email} value={this.state.email} error={this.state.formErrors.email} />
                <FormInput {...this.state.inputTypes.password} value={this.state.password} error={this.state.formErrors.password} />

                <Button variant="primary" type="submit" className="btn-lg btn-block my-4">Login</Button>

                <div className="register-link mt-3">
                    <p className="lead">Do not have an account? <Link to={`${this.props.match.url}/register`}>Please register here!</Link></p>
                </div>
            </Form>
        );
    }
};

export default withRouter(Login);