import 'bootstrap/dist/css/bootstrap.min.css';
import CriaPergunta from '../components/CriaPergunta.js';
import { auth } from '../firebase/config.js';
import { useAuthState } from "react-firebase-hooks/auth"
import { Navigate } from 'react-router-dom';
import PerguntasUsuario from '../components/PerguntasUsuario.js';
import { useState, useEffect } from 'react';
import { consultaIDPublicacoesCriadas } from '../firebase/functions.js';

export default function PerguntasUsuarioPage() {
    const [user, loading, error] = useAuthState(auth);
    const [idPublicacoesCriadas, setIdPublicacoesCriadas] = useState([]);

    useEffect(() => {
        const fetchIDPublicacoesCriadas = async () => {
            if (user) {
                let id_publicacoes_criadas = await consultaIDPublicacoesCriadas(user.uid);
                setIdPublicacoesCriadas(id_publicacoes_criadas);
            }
        };
        fetchIDPublicacoesCriadas();
    }, [user]);

    const adicionarPublicacaoCriada = (novoId) => {
        setIdPublicacoesCriadas((prevIds) => [...prevIds, novoId]);
    };

    if (loading) 
        return (<div>Carregando...</div>);
    if (error)
        return (<div>Error: {error}</div>);
    if (!user)
        return (<Navigate to="/" />);
    if (user)
        return (
            <>
                <CriaPergunta adicionarPublicacaoCriada={adicionarPublicacaoCriada} />
                <PerguntasUsuario uid={user.uid} idPublicacoesCriadas={idPublicacoesCriadas} />
            </>
        );
};
