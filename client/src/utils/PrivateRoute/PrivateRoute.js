import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import {Spinner} from 'react-bootstrap';
import {connect} from 'react-redux';

const PrivateRoute = ({component : Component, auth, ...rest}) => {

    return (
        <Route
            {...rest}
            render = {(props) => {
                if(auth.isLoading) {
                    return <Spinner animation="border" variant="dark"></Spinner>;
                }
                else if(!auth.twoFactor && !auth.token) {
                    return <Redirect to="/auth"></Redirect>;
                }
                else {
                    return <Component {...props} />;
                } 
            }}
        />
    );
};

const mapStateToProps = state => {
    return {
        auth : state.auth
    };
};

export default connect(mapStateToProps)(PrivateRoute);