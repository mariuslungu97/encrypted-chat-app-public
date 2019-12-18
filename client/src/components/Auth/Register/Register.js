import React, {Component} from 'react';
import {Form, Button, Alert} from 'react-bootstrap';
import {Link, Redirect, withRouter} from 'react-router-dom';
import {validateEmail, validatePassword, isFormValid} from '../../../utils/FormValidation/FormValidation';
import uuid from 'uuid';
import {connect} from 'react-redux';
import {clearError} from '../../../actions/errorActions';
import FormInput from '../../FormInput/FormInput';

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email : null,
            password : null,
            repeatPass : null,
            formErrors : {
                email : '',
                password : '',
                repeatPass : ''
            },
            inputTypes : {
                email : {id : 'authRegisterEmail', label : 'Email Address:', type : "email", placeholder : "Enter your mail...", name : "email", handleChange : this.handleChange},
                password : {id : 'authRegisterPassword', label : 'Password:', type : 'password', placeholder : 'Enter your password...', name : 'password', handleChange : this.handleChange},
                repeatPass : {id : 'authRegisterRepeatPass', label : 'Repeat Password:', type : 'password', placeholder : 'Repeat your password...', name : 'repeatPass', handleChange : this.handleChange}
            },
            showAlert : true,
            redirect : null
        };
        
    };

    componentDidMount() {
        //clear previous errors
        this.props.clearError();
    };

    componentDidUpdate(prevProps) {
        const isRegistered = this.props.isRegistered;
        if(isRegistered !== prevProps.isRegistered) {
            this.setState({
                ...this.state,
                redirect : true
            });
        };
    }
    
    handleShowAlert = () => this.setState({showAlert : false});

    handleChange = e => {
        //grab changed data (value) and current component state
        const {name, value} = e.target;
        const formErrors = {...this.state.formErrors};
        //set new value state
        this.setState({[name] : value});

        //check for errors
        switch(name) {
            case 'email' :
                if(value.length === 0 || !validateEmail(value)) formErrors.email = 'Invalid email address!';
                else formErrors.email = '';
                break;
            case 'password':
                if(value.length === 0) formErrors.password = 'Your password is too short';
                //password.length > 0
                else {
                    const passErrArr = validatePassword(value);
                    if(passErrArr.length > 0) {
                        formErrors.password = [...passErrArr].join(' ');
                    }
                    else formErrors.password = '';
                }
                break;
            case 'repeatPass':
                if(value.length === 0 || this.state.password !== value) formErrors.repeatPass = 'Passwords do not match.';
                else formErrors.repeatPass = '';
                break;
            default :
                break;
        };

        this.setState({formErrors});
    };

    //check form validation
    validateForm = (e, submitCallback = this.props.handleRegister) => {
        //prevent page refresh
        e.preventDefault();
        const formErrors = {...this.state.formErrors};
        const notEmptyForm = this.state.email !== null && this.state.password !== null && this.state.repeatPass !== null;
        //submit form callback if current form state is valid
        if(isFormValid(formErrors) && notEmptyForm) submitCallback(this.state.email, this.state.password, uuid());
    }

    render() {
        let alert;
        
        if(this.props.isRegistered && this.state.redirect) return <Redirect to="/auth"></Redirect>;

        if (this.props.isRegistered === false && this.props.error.message && this.props.error.status) {

                alert = (
                    <Alert show={this.state.showAlert} dismissible onClose={this.handleShowAlert.bind(this)} variant='danger'>
                        <Alert.Heading>You have failed to register. Please try again.</Alert.Heading>
                        {this.props.error.message ? <p>Reason: {this.props.error.message}</p> : null}
                    </Alert>
                );
        };

        return (
            <Form noValidate onSubmit={(e) => this.validateForm(e)}> 
                {alert}   
                <p className="lead my-4">Register:</p>
                
                <FormInput {...this.state.inputTypes.email} value={this.state.email} error ={this.state.formErrors.email} />
                <FormInput {...this.state.inputTypes.password} value={this.state.password} error ={this.state.formErrors.password}/>
                <FormInput {...this.state.inputTypes.repeatPass} value={this.state.repeatPass} error ={this.state.formErrors.repeatPass}/>

                <Button variant="primary" type="submit" className="btn-lg btn-block my-4">Register</Button>

                <div className="login-link mt-3">
                    <p className="lead">Already have an account? <Link to="/auth">Please login here!</Link></p>
                </div>
            </Form>
        )
    }
};

const mapStateToProps = state => ({
    error : state.error,
    isRegistered : state.auth.isRegistered
});

export default withRouter(connect(mapStateToProps, {clearError})(Register));