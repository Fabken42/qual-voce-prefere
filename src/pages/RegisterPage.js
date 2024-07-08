import React, { useState } from 'react';
import { auth, provider } from "../firebase/config";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils.js';

const RegisterPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            handleError('Senhas não coincidem!');
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            handleSuccess('Sucesso ao cadastrar!');
            navigate('/entrar');
        } catch (error) {
            handleError('Erro ao cadastrar!');
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
                    <h2 className="text-center">Cadastrar</h2>
                    <Form onSubmit={handleSignup}>
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

                        <Form.Group controlId="formConfirmPassword" className="mb-3">
                            <Form.Label>Confirmar Senha:</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirme sua senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Cadastrar
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

export default RegisterPage;
