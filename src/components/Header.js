import { Navbar, Nav, Container } from "react-bootstrap";
import { auth, provider } from "../firebase/config.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from 'firebase/auth';
import { atualizaUIDsCadastrados, consultaUIDsCadastrados, criaUsuario } from "../firebase/functions.js";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const [user] = useAuthState(auth);
    const [UIDsCadastrados, setUIDsCadastrados] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUIDsCadastrados = async () => {
            const uids_cadastrados = await consultaUIDsCadastrados();
            setUIDsCadastrados(uids_cadastrados);
        }
        if (user) fetchUIDsCadastrados();
    }, [user])

    useEffect(() => {
        const fetchData = async () => {
            if (user && UIDsCadastrados.length && !UIDsCadastrados.includes(user.uid)) {
                await atualizaUIDsCadastrados([user.uid, ...UIDsCadastrados]);
                await criaUsuario(user.uid, user.displayName);
            }
        }
        fetchData();
    }, [UIDsCadastrados])

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand>
                    <Nav.Link href="/">O que você prefere?</Nav.Link>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link href="/">Jogar</Nav.Link>
                        {user ? (
                            <>
                                <Nav.Link href="/perguntas-do-usuario">Suas Perguntas</Nav.Link>
                                <Nav.Link onClick={() => auth.signOut()}>Sair</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link onClick={() => navigate('/entrar')}>Entrar</Nav.Link>
                                <Nav.Link onClick={() => navigate('/cadastrar')}>Cadastrar</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
