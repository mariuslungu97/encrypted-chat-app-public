import React from 'react';
import {Row, Col, Button, ButtonGroup, Table, Pagination, Modal, Form, Spinner} from 'react-bootstrap';
import {connect} from 'react-redux';

import InvitationItem from './InvitationItem/InvitationItem';
import {setNewPage, setNewType} from '../../actions/invitationsActions';
import FormInput from '../FormInput/FormInput';

//IMPLEMENT FormInput here (+ test createNewInvitation, pagination, accept or reject invitation)

const Invitations = ({invitations, conversationName, formErrors, email, auth, showModal, modalToggler, setNewPage, setNewType, updateInvitations, inputHandler, formHandler}) => {
    
    let invitationsData, invitationItems, loadingSpinner, userEmail, nrPages, currPage = null;
    
    loadingSpinner = (
        <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
        </Spinner>
    );

    if(invitations.isLoaded) {
        invitationsData = invitations.invitations.data;
        nrPages = invitations.invitations.meta.nrPages;
        currPage = invitations.invitations.meta.page;
    } 
    if(auth.isLoaded) userEmail = auth.user.attributes.email;

    let pagination = null;
    
    if(invitationsData && nrPages) {
        //invitations data has been retrieved from the server; render invitationItems and pagination
        invitationItems = invitationsData.map(invitation => {

            const isSender = userEmail === invitation.from.email ? true : false;

            return (
                <InvitationItem date={invitation.createdAt} 
                            toFrom = {isSender ? invitation.to.email : invitation.from.email} 
                            status={invitation.status}
                            key={invitation._id}
                            id={invitation._id} 
                            isSender={isSender}
                            update={isSender ? null : updateInvitations} />
            )
        });

        let isDisabledPrev, isDisabledNext = null;

        isDisabledPrev = (currPage + 1) === 1 ? true : false;
        isDisabledNext = (currPage + 1) === nrPages ? true : false;

        pagination = (
            <Pagination className="u-justify-self-end" size="md">
                <Pagination.Prev disabled = {isDisabledPrev} onClick={!isDisabledPrev ? () => setNewPage(currPage - 1) : null}/>
                <Pagination.Item>{currPage + 1}</Pagination.Item>
                <Pagination.Next disabled = {isDisabledNext} onClick={!isDisabledNext ? () => setNewPage(currPage + 1) : null}/>
            </Pagination>
        );
    };

    return (
         
        <React.Fragment>
            
            <Modal show={showModal} onHide={modalToggler}>
                <Modal.Header closeButton>
                    <Modal.Title>Create a new Invitation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="my-4" onSubmit={(e) => formHandler(e)}>
                        <FormInput inputClass="my-3" 
                                   id="invitationName" 
                                   label="Conversation Name: "
                                   placeholder="Enter conversation name..." 
                                   handleChange={inputHandler}
                                   name="conversationName"
                                   type="text"
                                   value={conversationName}
                                   error={formErrors.conversationName}
                        />
                        <FormInput inputClass="my-3" 
                                   id="invitationEmail" 
                                   label="Who are you inviting to a secret conversation?"
                                   placeholder="Enter email to invite..." 
                                   handleChange={inputHandler}
                                   name="email"
                                   type="email"
                                   value={email}
                                   error={formErrors.email}
                        />  
                    
                        <Button size="lg" block variant="primary" type="submit" className="mt-4">
                            Send Invitation 
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Row className="justify-content-md-center align-items-center my-3">
                <Col sm={10} md={8}>
                    <h2 className="text-light">Invitations:</h2>
                    <p className="lead">Here you can accept, reject or create new invitations for secret conversations!</p>
                </Col>
                <Col className="d-flex" sm={10} md={2} >
                    <Button className="u-justify-self-end" onClick={modalToggler} variant="outline-light">Send Invitation</Button>
                </Col>
            </Row>

            <Row className="justify-content-md-center align-items-center my-3 text-center">
                <Col sm={10}>
                    <Table className="text-center" striped variant="dark" bordered hover>
                        <thead>
                            <tr>
                                <th>Date:</th>
                                <th>Sender/Receiver:</th>
                                <th>Status:</th>
                                <th>Accept/Reject</th>
                            </tr>
                        </thead>
                        <tbody className="align-middle">
                            {invitationItems}
                        </tbody>
                        
                    </Table>
                    {invitations.isLoading ? loadingSpinner : null}
                </Col>
            </Row>

            <Row className="justify-content-md-center align-items-center my-5">
                <Col xs={10} sm={8}>
                    <ButtonGroup aria-label="sentReceivedAll">
                        <Button onClick={() => setNewType('sent')} variant="light">Sent</Button>
                        <Button onClick={() => setNewType('received')} variant="light">Received</Button>
                        <Button onClick={() => setNewType('all')} variant="light">All</Button>
                    </ButtonGroup>
                </Col>
                <Col className="d-flex" xs={10} sm={2}>
                    {pagination}
                </Col>
            </Row>
        </React.Fragment>
        
    )
};

const mapStateToProps = state => {
    return {
        auth : state.auth,
        invitations : state.invitations
    };
};

export default connect(mapStateToProps, {setNewPage, setNewType})(Invitations);
