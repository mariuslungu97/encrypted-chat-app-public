import React, { Component } from 'react';
import {Row, Col} from 'react-bootstrap';
import {connect} from 'react-redux';

import ConversationWindow from './ConversationWindow/ConversationWindow';
import InformationWindow from './InformationWindow/InformationWindow';
import {joinRoom, sendPublicKey, isTyping, sendMessage, encryptData, setSocketEventListeners} from '../../actions/socketActions';

class Conversations extends Component {

    state = {
        conversationData : null,
        message : '',
        typingTimeout : 0
    }

    componentDidMount() {
        
        const {match : {params}} = this.props;
        const isConnected = this.props.socket.isConnected;
        //set socket event listeners
        if(isConnected) this.props.setSocketEventListeners();

        //join room
        if(params.roomId) this.props.joinRoom(params.roomId, Date.now());

        //set local Component state to contain info about the current conversation
        if(this.props.conversations.conversations && this.props.conversations.conversations.data) {
            
            const data = this.props.conversations.conversations.data;

            const roomIds = data.map(room => room.roomId);

            const currentRoomInfo = data[roomIds.findIndex(el => el === params.roomId)];

            if(currentRoomInfo) this.setState({
                conversationData : {
                    ...currentRoomInfo,
                    members : [...currentRoomInfo.members]
                }
            });
        }
    };

    componentDidUpdate(prevProps) {
        
        const {match : {params}} = this.props;
        const conversations = this.props.conversations.conversations;
        const isConnected = this.props.socket.isConnected;
        //set socket event listeners if socket is connected to server
        if(isConnected && prevProps.socket.isConnected !== isConnected) this.props.setSocketEventListeners();

        //check if roomId has been updated
        if(params.roomId && params.roomId !== prevProps.match.params.roomId) {
            //join room
            this.props.joinRoom(params.roomId, Date.now());
            
            //set local Component state to contain info about the current conversation
            if(conversations && conversations.data ) {
                const data = conversations.data;

                const roomIds = data.map(room => room.roomId);
    
                const currentRoomInfo = data[roomIds.findIndex(el => el === params.roomId)];
    
                if(currentRoomInfo) this.setState({
                    conversationData : {
                        ...currentRoomInfo,
                        members : [...currentRoomInfo.members]
                    },
                    message : ''
                });
            }
        } else if (!this.state.conversationData) {
            if(conversations && conversations.data) {
                const data = conversations.data;

                const roomIds = data.map(room => room.roomId);
    
                const currentRoomInfo = data[roomIds.findIndex(el => el === params.roomId)];
    
                if(currentRoomInfo) this.setState({
                    conversationData : {
                        ...currentRoomInfo,
                        members : [...currentRoomInfo.members]
                    },
                    message : ''
                });
            }
        };

        if(this.props.socket.receiverPublicKey && this.props.socket.receiverPublicKey !== prevProps.socket.receiverPublicKey) this.props.sendPublicKey(); 

    }

    messageInputHandler = e => this.setState({[e.target.name] : e.target.value});

    messageFormHandler = (e, timestamp) => {
        e.preventDefault();
        if(this.state.message && this.state.message.length > 0 && timestamp) {
            this.props.encryptData(this.state.message, timestamp, this.props.socket.receiverPublicKey);
            this.setState({
                message : ''
            });
        }
    };

    isTypingHandler = (timestamp) => {
        if(this.state.typingTimeout) clearTimeout(this.state.typingTimeout);

        if(timestamp) this.props.isTyping(timestamp, true);

        this.setState({
            typingTimeout : setTimeout(() => {
                this.props.isTyping(timestamp, false);
            }, 3000)
        })
    };
    
    render() {
        return (
            <React.Fragment>
                <Row className="my-3 mx-3 h-100">
                    <Col sm={6} className="mx-3">
                        <ConversationWindow 
                            name={this.state.conversationData ? this.state.conversationData.conversationName : null}
                            messages={this.props.socket.messages}
                            email={this.props.email}
                            formHandler={this.messageFormHandler}
                            inputHandler={this.messageInputHandler}
                            formMessage={this.state.message}
                            isTypingHandler={this.isTypingHandler}
                            isTyping={this.props.socket.isTyping}
                            />
                    </Col>

                    <Col sm={5} className="w-100 mx-3 text-center h-100 information">
                        <InformationWindow publicKey={this.props.socket.publicKey} receiverPublicKey={this.props.socket.receiverPublicKey} />
                    </Col>
                </Row>
            </React.Fragment>
        )
    }
};

const mapStateToProps = state => {
    return {
        conversations : state.conversations,
        socket : state.socket,
        email : state.auth.user ? state.auth.user.attributes.email : ''
    };
};

export default connect(mapStateToProps, {setSocketEventListeners, encryptData, sendPublicKey, isTyping, joinRoom, sendMessage})(Conversations);
