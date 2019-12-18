import React, { Component } from 'react';
import {Container, Row, Col, Jumbotron, Form, Button, Alert} from 'react-bootstrap';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';

import {loginUser} from '../../actions/authActions';
import {clearError} from '../../actions/errorActions';
import FormInput from '../FormInput/FormInput';

class TwoFactor extends Component {

    state = {
        token : '',
        tokenError : ''
    };

    componentDidMount() {
        this.props.clearError();
    };

    componentDidUpdate(prevProps) {
        if(this.props.error.message !== prevProps.error.message) {
            if(this.props.error.id === 'totp_syntax_not_valid' || this.props.error.id === 'totp_not_valid') {
                this.setState({
                    tokenError : this.props.error.message
                });
            };
        };
    };
    
    tokenInputHandler = (e) => {
        const {name, value} = e.target;

        this.setState({[name] : value});
    };

    tokenSubmitHandler = (e) => {
        e.preventDefault();

        const token = this.state.token;

        if(token && !isNaN(parseInt(token, 10)) && token.length === 6) {
            //submit token (loginUser method)
            this.props.loginUser(null, null, token);
        }
    };

    render() {

        const token = this.props.auth.token;

        if(token && !this.props.auth.twoFactor) return <Redirect to="/"></Redirect>;

        const error = this.state.tokenError;
        let alert = null;

        if(error && error.length > 0) alert = <Alert variant="danger" dismissible>{error}</Alert>;

        return (
            <Container className="h-100">
                <Row className="h-100">
                    <Col xs="10" md="8" className="d-flex justify-content-center align-items-center mx-auto">
                    <Jumbotron className="bg-dark text-light py-3">
                        <div className="leading-text my-4">
                            <h1 className="lead">Submit your Authenticator Token!</h1>
                        </div>

                        {alert}

                        <Form onSubmit={this.tokenSubmitHandler} className="my-5">
                            
                            <FormInput id="twoFactorToken" 
                                       name="token" 
                                       label="Token:" 
                                       type="text"
                                       value={this.state.token}
                                       error='' 
                                       placeholder="Enter your token..."
                                       handleChange = {this.tokenInputHandler}
                            />

                            <Button variant="primary" type="submit" className="btn-lg btn-block my-5">Submit</Button>

                        </Form>
                        
                
                    </Jumbotron>      
                    </Col>
                </Row>
            </Container>
        )
    }
};

const mapStateToProps = state => {
    return {
        auth : state.auth,
        error : state.error
    };
};

export default connect(mapStateToProps, {loginUser, clearError})(TwoFactor);
