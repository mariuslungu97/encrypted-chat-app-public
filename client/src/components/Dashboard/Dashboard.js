import React, { Component } from 'react';
import uuid from 'uuid';
import {connect} from 'react-redux';
import {Switch, Route} from 'react-router-dom';

import './Dashboard.css';

import DNavbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';
import Invitations from '../Invitations/Invitations';
import Conversations from '../Conversations/Conversations';
import Settings from '../Settings/Settings';
import {validateEmail, isFormValid} from '../../utils/FormValidation/FormValidation';

import {logoutUser, loadUser, resendVerificationMail} from '../../actions/authActions';
import {getInvitations, patchInvitation, createInvitation} from '../../actions/invitationsActions';
import {getQRCode, activateTwoFactor} from '../../actions/twoFactorActions';
import {getConversations, setNewConversationsPage, setNewConversationsType} from '../../actions/conversationsActions';
class Dashboard extends Component {

    state = {
        isSidebarToggle : true,
        showInvitationsModal : false,
        conversationName : null,
        email : null,
        formErrors : {
            conversationName : '',
            email : ''
        },
        twoFactorToken : ''
    };

    componentDidMount() {
        //if not already loaded, load user
        if(!this.props.auth.isLoaded) this.props.loadUser();

        //load invitations
        if(!this.props.invitations.isLoaded && this.props.auth.isLoaded) this.props.getInvitations(this.props.invitations.currentPage, this.props.invitations.currentType);
        
        //load conversations
        if(!this.props.conversations.conversationsLoaded && this.props.auth.isLoaded) this.props.getConversations(this.props.conversations.currentPage, this.props.conversations.currentType);
        
    };

    componentDidUpdate(prevProps) {
        //close modal if invitation has been created
        if(this.props.invitations.isCreated !== prevProps.invitations.isCreated) {

            if(this.props.invitations.isCreated) {

                this.setState({showInvitationsModal : false});
            } 
        };
        
    }
    //updateInvitation Handler
    updateInvitation = (id, newStatus) => this.props.patchInvitation(id, newStatus);

    //resend verification mail
    resendVerificationMailHandler = (userId) => this.props.resendVerificationMail(userId);
    
    //Modal input handler + client-side validation for mail and conversation name
    modalInputHandler = (e) => {
        const {name, value} = e.target;
        const formErrors = {...this.state.formErrors};

        this.setState({
            [name] : value
        });

        switch(name) {
            case 'email' :
                if(value.length === 0 || !validateEmail(value)) formErrors.email = 'Invalid email address!';
                else formErrors.email = '';
                break;
            case 'conversationName' :
                if(value.length === 0 || typeof value !== 'string') formErrors.conversationName = 'Invalid conversation name!';
                else formErrors.conversationName = '';
                break;
            default:
                break; 
        };

        this.setState({formErrors});
    };

    twoFactorTokenInputHandler = (e) => this.setState({twoFactorToken : e.target.value});

    twoFactorSubmitHandler = (e) => {
        e.preventDefault();

        const token = this.state.twoFactorToken;

        if(token && !isNaN(parseInt(token, 10))) this.props.activateTwoFactor(token);
    };

    //Form Handler for creating new invitations
    createNewInvitationHandler = (e) => {
        e.preventDefault();

        const {conversationName, email} = this.state;

        const formErrors = {...this.state.formErrors};

        const notEmptyForm = this.state.email !== null && this.state.conversationName !== null;

        if(notEmptyForm && isFormValid(formErrors)) this.props.createInvitation(conversationName, email, uuid());
    }

    logoutToggler = () => this.props.logoutUser();

    //Sidebar Toggler
    toggleSidebar = () => {
        this.setState(prevState => {
            return {
                isSidebarToggle : !prevState.isSidebarToggle
            };
        });
    };

    //Invitations Modal Toggler
    modalToggler = () => {
        this.setState(prevState => {
            return {
                showInvitationsModal : !prevState.showInvitationsModal
            }
        });
    };

    render() {

        return ( 
            <div className="d-flex flex-row w-100 wrapper">
                <Sidebar conversations= {this.props.conversations}
                         setNewPage={this.props.setNewConversationsPage}
                         setNewType={this.props.setNewConversationsType}
                         sidebarState = {this.state.isSidebarToggle} 
                         toggleSidebar = {this.toggleSidebar}
                         
                />
                <div className="page-content-wrapper bg-secondary text-light">
                    <DNavbar logoutToggler={this.logoutToggler} />
                    <div className="container-fluid h-100">
                        <Switch>
                            <Route render = {(props) => <Invitations {...props} 
                                                                    formErrors={this.state.formErrors} 
                                                                    email={this.state.email} 
                                                                    conversationName={this.state.conversationName} 
                                                                    inputHandler={this.modalInputHandler} 
                                                                    formHandler={this.createNewInvitationHandler} 
                                                                    updateInvitations={this.updateInvitation} 
                                                                    modalToggler = {this.modalToggler} 
                                                                    showModal = {this.state.showInvitationsModal} /> } 
                                                                    exact path = {[`${this.props.match.path}`, `${this.props.match.path}invitations`]} />
                            <Route render = {(props) => <Settings {...props} 
                                                                isActive={this.props.auth.user.attributes.isActive}
                                                                isTwoFactorActive={this.props.auth.user.attributes.isTwoFactorActive}
                                                                emailVerificationHandler={this.resendVerificationMailHandler}
                                                                userId={this.props.auth.user.userId}
                                                                getCode={this.props.getQRCode}
                                                                twoFactor={this.props.twoFactor}
                                                                inputHandler={this.twoFactorTokenInputHandler}
                                                                token={this.state.twoFactorToken}
                                                                submitHandler={this.twoFactorSubmitHandler} />} 
                                                                exact path = {`${this.props.match.path}settings`} />
                            <Route render={(props) => <Conversations {...props}
                                                                />} 
                                                                exact path = {`${this.props.match.path}conversations/:roomId`} />
                        </Switch>
                    </div>
                </div>
            </div>
        )
    }
};

const mapStateToProps = state => ({
    error : state.error,
    auth : state.auth,
    invitations : state.invitations,
    twoFactor : state.twoFactor,
    conversations : state.conversations
});

export default connect(mapStateToProps, {setNewConversationsPage, setNewConversationsType, logoutUser, getConversations, activateTwoFactor, getQRCode, resendVerificationMail, loadUser, getInvitations, patchInvitation, createInvitation})(Dashboard);
