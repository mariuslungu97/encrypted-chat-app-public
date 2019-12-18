import React from 'react';
import {Form, Button} from 'react-bootstrap';

import ConversationItem from '../ConversationItem/ConversationItem';

const ConversationWindow = ({name, email, isTyping, formMessage, messages, formHandler, inputHandler, isTypingHandler}) => {
    
    let pastMessages = null;
    let isTypingSpinner = null;

    if(isTyping && isTyping.length > 0) isTypingSpinner = (
        <div className="spinner">
            <div className="spinner-loader__wrapper"></div>
            <div className="spinner__text text-muted lead">{isTyping}</div>
        </div>
    );

    if(messages && messages.length > 0) {
        pastMessages = messages.map(message => {
            const username = message.email.substring(0, message.email.lastIndexOf('@'));    
            let time = new Date(message.timestamp);
            time = `${time.getHours()}:${time.getMinutes()}`;
            const isMe = email === message.email ? true : false;
            
            return (
                <ConversationItem
                    key={message.timestamp}
                    user={username}
                    type={message.type}
                    id={message.id}
                    time={time}
                    message={message.message}
                    isMe={isMe}
                />
            );
        });

    }

    return (
        <div>
            <div className="chat bg-light">
                <div className="chat-header bg-dark text-center">
                    <p className="chat-header__name lead">{name}</p>
                </div>
                <div className="chat-history">
                    {pastMessages}
                    {isTypingSpinner}
                </div>
                <div className="chat-controls">
                    <Form onSubmit={(e) => formHandler(e, Date.now())}>
                        <div className="chat-controls__input">
                            <Form.Control onKeyPress={isTypingHandler.bind(this, Date.now())} name='message' value={formMessage} onChange={inputHandler} className="chat-controls__textarea" as="textarea" rows="2" placeholder="Send Message..."></Form.Control>
                        </div>
                        <div className="chat-controls__buttons">
                            
                            <Button variant="dark" type="submit">
                                Send
                            </Button>
                            
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
};

export default ConversationWindow;
