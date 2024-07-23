import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { LinkContainer } from 'react-router-bootstrap'
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <>
        <Navbar bg="light" data-bs-theme="light">
            <div className="ms-3">
                <LinkContainer to="/">
                    <Navbar.Brand>FinanceAI</Navbar.Brand>
                </LinkContainer>
            </div>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
                <LinkContainer to="/">
                    <Nav.Link>Home</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/dashboard">
                    <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/explore">
                    <Nav.Link>Explore</Nav.Link>
                </LinkContainer>
            </Nav>
            <Nav className="me-3">
                <Button variant="light" href="/signup">Sign Up</Button>
                <Button variant="light" href="/login">Login</Button>
            </Nav>
            </Navbar.Collapse>
        </Navbar>
        <div className="ms-3">
            <Outlet />
        </div>
        </>
    )
}

export default Layout;