import React, { useState } from 'react';
import { auth, provider } from "../firebase/config";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils.js';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            handleSuccess('Sucesso ao entrar!');
            navigate('/');
        } catch (error) {
            handleError('Erro ao entrar!');
            console.log(error.message);
        }
    }

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, provider);
            handleSuccess('Sucesso ao entrar!');
            navigate('/');
        } catch (error) {
            handleError('Erro ao entrar!');
            console.log(error.message);
        }
    }

    return (
        <Container className="mt-5" style={{ maxWidth: '500px', padding: '30px', borderRadius: '10px', backgroundColor: '#f8f9fa', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
            <Row className="justify-content-center">
                <Col>
                    <h2 className="text-center">Entrar</h2>
                    <Form onSubmit={handleLogin}>
                        <Form.Group controlId="formBasicEmail" className="mb-3">
                            <Form.Label>Email:</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Digite seu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword" className="mb-3">
                            <Form.Label>Senha:</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Entrar
                        </Button>
                    </Form>
                    <Button className="mt-3 w-100" variant="danger" onClick={signInWithGoogle}>
                        Continuar com Google
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginPage;
