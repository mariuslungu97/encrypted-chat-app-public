import React from 'react';
import {Row, Container} from 'react-bootstrap';

const InformationWindow = ({publicKey, receiverPublicKey}) => {
    
    publicKey = publicKey ? publicKey : '';
    receiverPublicKey = receiverPublicKey ? receiverPublicKey : '';

    return (
        <React.Fragment>
            <Container fluid className="information-window d-flex h-100 flex-column text-center align-items-center">
                <Row className="d-flex flex-column align-items-center my-3 text-center">
                    <p className="lead">Your Public RSA Key: </p>
                    <p className="text-success">{publicKey}</p>
                </Row>
                <Row className="d-flex flex-column align-items-center my-3 text-center">
                    <p className="lead">His Public RSA Key: </p>
                    <p className="text-dark">{receiverPublicKey}</p>
                </Row>
            </Container>
        </React.Fragment>
    )
};

export default InformationWindow;
