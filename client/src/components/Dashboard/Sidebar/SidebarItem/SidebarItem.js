import React from 'react'
import {ListGroup, Button} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faTimesCircle, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {Link} from 'react-router-dom';

const SidebarItem = ({status, name, date, members, link}) => {

    let listItem = null;
    /*status values: 
        active - secret conversation is still going on) => meta info cannot be deleted, conversation has to be closed first 
        inactive - conversation is archived and only meta info is available => meta info can be deleted from DB
        TODO #1: hook active item to link (react-router) to /conversations/id
        TODO #2: hook inactive item trash button to delete conversation meta info
    */
    if (status && status === 'active') {
        const iconStyles = ['w-25', 'sidebar-wrapper__item--icon', 'text-success'];
        const icon = faCheckCircle;

        listItem = (
            <ListGroup.Item as={Link} to={link} action className="sidebar-wrapper__item bg-dark">
                <div className="d-flex w-100 justify-content-between align-items-center">
                    <FontAwesomeIcon className={iconStyles.join(' ')} icon={icon ? icon : null}/>
                    <div className="sidebar-wrapper__item--content w-75">
                        <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1 sidebar-wrapper__item--heading text-light">Name: {name}</h6>
                            <small>Time: {date}</small>
                        </div>
                        <p className="my-1">Members: {members}</p>
                        <p className="my-1">Status: <span className="text-success text-uppercase"> {status} </span></p>
                    </div>
                </div>     
            </ListGroup.Item>
        );
    } else if (status && status === 'inactive') {
        const iconStyles = ['w-25', 'sidebar-wrapper__item--icon', 'text-danger'];
        const icon = faTimesCircle;
        listItem = (
            <ListGroup.Item as="div" action className="sidebar-wrapper__item sidebar-wrapper__item--inactive bg-dark">
                <div className="d-flex w-100 justify-content-between align-items-center">
                    <FontAwesomeIcon className={iconStyles.join(' ')} icon={icon ? icon : null}/>
                    <div className="sidebar-wrapper__item--content w-75">
                        <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1 sidebar-wrapper__item--heading text-light">Name: {name}</h6>
                            <small>Time: {date}</small>
                        </div>
                        <p className="my-1">Members: {members}</p>
                        
                        <div className="d-flex justify-content-between sidebar-wrapper__item--status">
                            <p className="my-1">Status: <span className="text-danger text-uppercase"> {status} </span></p>
                            <Button className="sidebar-wrapper__item--delete">
                                <FontAwesomeIcon icon={faTrashAlt} size="lg" />
                            </Button>
                        </div>
                    </div>
                </div>     
            </ListGroup.Item>
        );
    } else {
        listItem = (
            <ListGroup.Item disabled action className="sidebar-wrapper__item bg-dark">
                <div className="d-flex w-100 justify-content-between align-items-center">
                    <p>Information about this conversation cannot be retrieved from the server.</p>
                    <div className="d-flex justify-content-between sidebar-wrapper__item--status">
                        <p className="my-1">Status: <span className="text-danger"> {status} </span></p>
                        <Button className="sidebar-wrapper__item--delete">
                            <FontAwesomeIcon icon={faTrashAlt} size="lg" />
                        </Button>
                    </div>
                </div>
            </ListGroup.Item>
        );
    };

    return listItem;
};

export default SidebarItem;
