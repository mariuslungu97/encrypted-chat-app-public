import React from 'react';
import {ListGroup, Button, ButtonGroup, Pagination, Spinner} from 'react-bootstrap';
import SidebarItem from './SidebarItem/SidebarItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

function timeSince(date) {
    if(typeof date === 'string') date = new Date(date);

    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = Math.floor(seconds / 31536000);
  
    if (interval > 1) {
      return interval + "y";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + "m";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + "d";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + "h";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + "m";
    }
    return Math.floor(seconds) + "s";
}

const Sidebar = (props) => {

    let toggleBtnIcon = null;
    let sidebarStyles = ['text-white-50', 'bg-dark', 'sidebar-wrapper', 'd-flex', 'flex-column'];
    const isToggled = props.sidebarState;
    if(isToggled) toggleBtnIcon = faArrowLeft;
    else {
        toggleBtnIcon = faArrowRight;
        sidebarStyles.push('toggler');
    };

    let conversations, conversationsList, nrPages, currentPage, pagination = null;

    const loadingSpinner = (
        <div className="d-flex justify-content-center my-3">
            <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
            </Spinner>
        </div>
    );

    if(props.conversations.conversations && props.conversations.conversations.data && props.conversations.conversations.meta) {

        conversations = props.conversations.conversations.data;
        nrPages = props.conversations.conversations.meta.nrPages;
        currentPage = props.conversations.conversations.meta.page;

        conversationsList = conversations.map(conversation => {

            const members = conversation.members.map(member => member.email);

            return (
                <SidebarItem 
                    link={`/conversations/${conversation.roomId}`} 
                    status={conversation.status} 
                    name={conversation.conversationName} 
                    date={`${timeSince(conversation.createdAt)} ago`}
                    members={members.join(', ')}
                    key={conversation.roomId} 
                />
            );
        });

        let isDisabledPrev, isDisabledNext = null;

        isDisabledPrev = (currentPage + 1) === 1 ? true : false;
        isDisabledNext = (currentPage + 1) === nrPages ? true : false;

        pagination = (
            <Pagination className="sidebar-wrapper__pagination" size="md">
                <Pagination.Prev disabled = {isDisabledPrev} onClick={!isDisabledPrev ? () => props.setNewPage(currentPage - 1) : null}/>
                <Pagination.Item>{currentPage + 1}</Pagination.Item>
                <Pagination.Next disabled = {isDisabledNext} onClick={!isDisabledNext ? () => props.setNewPage(currentPage + 1) : null}/>
            </Pagination>
        );
    }

    return (
        <div className={sidebarStyles.join(' ')}>
            <Button onClick={props.toggleSidebar} className="sidebar-wrapper__toggler" variant="primary">
                <FontAwesomeIcon icon={toggleBtnIcon ? toggleBtnIcon : null} />
            </Button>

            <div className="sidebar-wrapper__heading">My Conversations</div>

            <div className="text-center sidebar-wrapper__metaType">      
                
                <p className="lead">Conversation Type:</p>

                <ButtonGroup aria-label="metaConversationType">
                    <Button onClick={() => props.setNewType('active')} variant="secondary">Active</Button>
                    <Button onClick={() => props.setNewType('all')} variant="secondary">All</Button>
                </ButtonGroup>

            </div>

            {props.conversations.conversationsLoading ? loadingSpinner : null}

            <ListGroup variant="flush" className='sidebar-wrapper__list w-100'>
                
                {conversationsList}

            </ListGroup>

            {pagination}
        </div>
    )
};

export default Sidebar;
