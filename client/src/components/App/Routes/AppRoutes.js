import React, { Component } from 'react'
import {Switch, Route} from 'react-router-dom';
import PrivateRoute from '../../../utils/PrivateRoute/PrivateRoute';
import Auth from '../../Auth/Auth';
import Dashboard from '../../Dashboard/Dashboard';
import TwoFactor from '../../TwoFactor/TwoFactor';

class AppRoutes extends Component {
    render() {
        return (
            <div className={['vh-100', 'bg-secondary'].join(' ')}>
                <Switch>
                    <Route path="/auth" component = {Auth} />

                    <PrivateRoute path="/twofactor" component = {TwoFactor} />
                        
                    <PrivateRoute path="/" component={Dashboard}/>
                                                 
                </Switch>
            </div>
            
        )
    }
};



export default AppRoutes;
