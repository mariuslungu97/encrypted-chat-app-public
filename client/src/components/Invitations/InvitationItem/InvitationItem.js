import React from 'react';
import {ButtonGroup, Button} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faUserTimes, faQuestion } from '@fortawesome/free-solid-svg-icons';

function formatDate(date) {
    if(typeof date === 'string') date = new Date(date);
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

const InvitationItem = ({date, toFrom, status, isSender, id, update}) => {
    let btnGroup = null;
    let icon = null;
    
    if(isSender) {
        if(status && status === 'accepted') icon = <FontAwesomeIcon icon={faUserCheck} size="sm" className="text-success" /> 
        else if (status && status === 'rejected') icon = <FontAwesomeIcon icon={faUserTimes} size="sm" className="text-danger" />
        else if (status && status === 'pending') icon = <FontAwesomeIcon icon={faQuestion} size="sm" className="text-primary" />
    } else {
        if(status && status === 'accepted') icon = <FontAwesomeIcon icon={faUserCheck} size="sm" className="text-success" />
        else if (status && status === 'rejected') icon = <FontAwesomeIcon icon={faUserTimes} size="sm" className="text-danger" />
        else if (status && status === 'pending') btnGroup = (
            <ButtonGroup size="md">
                 <Button onClick={update ? () => update(id, 'accepted') : null} variant="secondary">Accept</Button>
                 <Button onClick={update ? () => update(id, 'rejected') : null} variant="secondary">Reject</Button>
            </ButtonGroup>
        );
    }

    return (
        <tr>
            <td className="align-middle">{formatDate(date)}</td>
            <td className="align-middle">{toFrom}</td>
            <td className="align-middle">{status}</td>
            <td className="align-middle">
                {icon ? icon : btnGroup}
            </td>
        </tr>
    )
};

export default InvitationItem;
