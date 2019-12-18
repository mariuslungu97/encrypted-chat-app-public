import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

const ConversationItem = ({user, type, time, message, isMe}) => {

    let messageItem = null;
    const itemStyles = ['chat-item'];

    if(type === 'error' || type === 'status') {
        itemStyles.push('chat-item-status');
        if(type === 'error') itemStyles.push('text-danger');
        
        messageItem = (
            <div className={itemStyles.join(' ')}>
                <div className="message">

                    <div className="message__info">
                        <p className="message__text">
                            {message}
                        </p>                           
                    </div>
                        
                </div>
            </div>
        );
    } else if(type === 'message') {
        if(isMe) itemStyles.push('chat-item-me');
        else itemStyles.push('chat-item-other');

        messageItem = (
            <div className={itemStyles.join(' ')}>
                <div className="message">

                    <div className="message__info my-1">
                        <div className="message__user-name">{user}</div>
                        <div className="message__time-div">
                            <FontAwesomeIcon className="mx-2" icon={faClock}></FontAwesomeIcon>
                            <time className="message__time">{time}</time>
                        </div>                              
                    </div>
                            
                    <p className="message__text">
                        {message}
                    </p>
                </div>
            </div>
        );
    };

    return (
        messageItem
    )
};

export default ConversationItem;
