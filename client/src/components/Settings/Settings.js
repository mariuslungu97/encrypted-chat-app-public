import React from 'react';
import {Row, Col, Button, Image, Spinner, Form} from 'react-bootstrap';

import FormInput from '../FormInput/FormInput';

const Settings = ({isActive, isTwoFactorActive, emailVerificationHandler, userId, getCode, twoFactor, token, inputHandler, submitHandler}) => {

    let url, image, tokenRow = null;

    const loadingSpinner = (
        <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
        </Spinner>
    );

    if(twoFactor.qrData) {
        url = twoFactor.qrData.url;

        image = <Image src={url} fluid />

        tokenRow = (
            <Row className="justify-content-md-center align-items-center text-center my-3">
                
                <Col xs={12} sm={10} md={4} className="d-flex align-items-center justify-content-center">
                    {image}
                </Col>
                <Col xs={12} sm={10} md={4} className="d-flex align-items-center justify-content-center">
                    <Form onSubmit={submitHandler}>
                        
                        <FormInput id="tokenInput"
                                   label="Please enter your generated token!"
                                   value={token}
                                   type="text"
                                   error=""
                                   placeholder="Token..."
                                   name="token"
                                   handleChange={inputHandler}
                        />
                        <Button variant="outline-light" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Col>
            </Row>
        );
    };

    return (
        <React.Fragment>
            <Row className="justify-content-md-center align-items-center my-3">
                <Col sm={10} md={8} className="text-center">
                    <div className="my-3">
                        <h2 className="text-light">Status: 
                            <span className={isActive ? 'text-success' : 'text-danger'}>{isActive ? '  ACTIVE' : '  INACTIVE'}</span>
                        </h2>
                    </div>

                    <div className="my-4">
                        <p className="lead">Did not receive confirmation mail?</p>
                        <Button onClick={() => emailVerificationHandler(userId)} size="lg" block disabled={isActive} variant="outline-light">Resend Confirmation Email!</Button>
                    </div>

                    <div className="my-4">
                        <p className="lead">Add an extra security measure for your account - only if account status is active! </p>
                        <Button onClick={getCode} size="lg" block disabled={!isActive || isTwoFactorActive} variant="outline-light">Activate 2-way Authentication!</Button>
                    </div>

                </Col>
            </Row>
            {twoFactor.isLoading ? loadingSpinner : null}
            {tokenRow}
        </React.Fragment>
    );
};

export default Settings;
