import React, {Component} from 'react';
import Login from './Login/Login';
import Register from './Register/Register';
import {Route, Switch, Redirect} from 'react-router-dom';
import {registerUser, loginUser} from '../../actions/authActions';
import {connect} from 'react-redux';
import {Alert, Container, Row, Col, Jumbotron} from 'react-bootstrap';

class Auth extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showAlert : true,
            alerts : {
                registerSuccess : null,
                loginFail : null
            },
            isAuth : null,
        }
        
    }

    componentDidUpdate(prevProps) {
        const { message } = this.props.error
        if(message !== prevProps.error.message) {
            const id = this.props.error.id;
            if(id === 'user_not_exists' || id === 'invalid_credentials' || id === 'pass_syntax_invalid') {
                this.setState({
                    ...this.state,
                    showAlert : true,
                    alerts : {
                        ...this.state.alerts,
                        loginFail : true
                    }
                });
            }
        };
        
        if (this.props.isRegistered !== prevProps.isRegistered) {
            const isRegistered = this.props.isRegistered;
            if(isRegistered) {
                this.setState({
                    ...this.state,
                    alerts : {
                        ...this.state.alerts,
                        registerSuccess : true
                    }
                });
            };
        };
        
        if(this.props.isAuthenticated !== prevProps.isAuthenticated) {
            const isAuth = this.props.isAuthenticated;
            if(isAuth) {
                this.setState({
                    ...this.state,
                    isAuth
                });
            };
        };

    }

    handleShowAlert = () => this.setState({showAlert : false});

    handleRegisterSubmit = (email, password, userId) => {
        //dispatch action creator
        if(email && password && userId) this.props.registerUser(email,password,userId);
    };

    handleLoginSubmit = (e, email, password) => {
        //TODO: dispatch action creator
        e.preventDefault();

        if(email && password) this.props.loginUser(email, password);

    }

    render() {
        let isAuth = this.state.isAuth;

        if(isAuth === true && this.props.isAuthenticated) return <Redirect to = "/"></Redirect>;
        else if (this.props.verifyToken) return <Redirect to="/twofactor"></Redirect>;

        let registerAlert, loginAlert;
        if(this.props.isRegistered === true && this.state.alerts.registerSuccess) registerAlert = <Alert show={this.state.showAlert} onClose={this.handleShowAlert.bind(this)} dismissible variant="success">You have successfully registered. You can now login!</Alert>
        
        if(this.props.error.message && this.state.alerts.loginFail) loginAlert = (
            <Alert show={this.state.showAlert} onClose={this.handleShowAlert.bind(this)} dismissible variant="danger">
                <Alert.Heading>You have failed to login</Alert.Heading>
                {this.props.error.message ? <p>Reason : {this.props.error.message}</p> : null}
            </Alert>
        );

        return (

            <Container className="h-100">
                <Row className="h-100">
                    <Col xs="10" md="8" className="d-flex align-items-center mx-auto">
                    <Jumbotron className="bg-dark text-light py-3">
                        <div className="leading-text my-2">
                        <h1 className="text-primary">Hi there!</h1>
                        <p>Welcome to the CryptoChat application, where you can communicate with your friends securely. Please login or register:</p>
                        </div>
                        
                        {registerAlert}
                        {loginAlert}
                        <Switch>
                            <Route path={this.props.match.path} exact>
                                <Login handleLogin={this.handleLoginSubmit}></Login>
                            </Route>
                            <Route path={`${this.props.match.path}/register`}>
                                <Register errorMessage = {this.props.error.message} isRegistered={this.props.isRegistered} handleRegister={this.handleRegisterSubmit}></Register>
                            </Route>
                        </Switch>
                    </Jumbotron>      
                    </Col>
                </Row>
            </Container>

        );
    };
};

const mapStateToProps = state => ({
    isRegistered : state.auth.isRegistered,
    isAuthenticated : state.auth.isAuthenticated,
    verifyToken : state.auth.twoFactor ? state.auth.twoFactor.verifyToken : null,
    error : state.error
});

export default connect(mapStateToProps, {registerUser, loginUser})(Auth);