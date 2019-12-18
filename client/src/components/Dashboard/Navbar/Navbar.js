import React from 'react';
import {Navbar, Nav, Container} from 'react-bootstrap';
import {Link} from 'react-router-dom';

const DNavbar = ({logoutToggler}) => {
    return (
    
        <Navbar bg="dark" expand="lg" variant="dark">
            <Container>
                <Link to="/" className="navbar-brand text-primary">EncryptedChatApp</Link>           
                <Navbar.Toggle aria-controls="home-dashboard" />
                <Navbar.Collapse id="home-dashboard">
                    <Nav className="ml-auto">               
                        <Link to="/invitations" className="mx-2 nav-link">Invitations</Link>
                        <Link to="/settings" className="mx-2 nav-link">Settings</Link>
                        <Link onClick={logoutToggler} to="/auth" className="mx-2 nav-link">Logout</Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        
    )
};

export default DNavbar;
