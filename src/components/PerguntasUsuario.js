import React, { useEffect, useState } from 'react';
import { consultaPublicacaoInfo } from '../firebase/functions';
import { listAll, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import PerguntaCriada from './PerguntaCriada';
import { Container } from 'react-bootstrap';

export default function PerguntasUsuario({ uid, idPublicacoesCriadas }) {
    const [publicacoesInfo, setPublicacoesInfo] = useState([]);
    const [imagensURLs, setImagensURLs] = useState([]);
    const [publicacoesIDs, setPublicacoesIDs] = useState([]);

    useEffect(() => {
        const fetchPublicacoesInfo = async () => {
            let tempPublicacoesInfo = [];
            let publicacoes_ids = []
            for (const idPublicacao of idPublicacoesCriadas) {
                const publicacao_info = await consultaPublicacaoInfo(idPublicacao);
                tempPublicacoesInfo.unshift(publicacao_info);
                publicacoes_ids.unshift(idPublicacao);
            }
            setPublicacoesInfo(tempPublicacoesInfo);
            setPublicacoesIDs(publicacoes_ids);
        };
        fetchPublicacoesInfo();
    }, [idPublicacoesCriadas]);

    useEffect(() => {
        if (publicacoesInfo.length) {
            Promise.all(
                publicacoesInfo.map(async (publicacao) => {
                    const imagemListaRef = ref(storage, `images/${uid}/${publicacao?.data}`);
                    const res = await listAll(imagemListaRef);
                    const urls = await Promise.all(
                        res.items.map(async (item) => {
                            return await getDownloadURL(item);
                        })
                    );
                    return urls;
                }) 
            ).then((imagensURLs) => {
                setImagensURLs(imagensURLs);
            });
        }
    }, [publicacoesInfo]);

    return (
        <Container>
            <hr className='mx-5'/>
            <h2 className="text-center text-primary mx-5 my-4 text-uppercase rounded-pill bg-light p-3 shadow">suas perguntas</h2>
            {imagensURLs.length &&
                publicacoesInfo.map((publicacaoInfo, index) => {
                    if (publicacaoInfo) {
                        return (
                            <>
                            <PerguntaCriada
                                pergunta1={publicacaoInfo.pergunta1}
                                pergunta2={publicacaoInfo.pergunta2}
                                votos1={publicacaoInfo.votos1}
                                votos2={publicacaoInfo.votos2}
                                data={publicacaoInfo.data}
                                autorId={publicacaoInfo.autorId}
                                urlImg1={imagensURLs[index] && imagensURLs[index][0]}
                                urlImg2={imagensURLs[index] && imagensURLs[index][1]}
                                publicacaoId={publicacoesIDs[index]}
                                mostrarLixeira={true}
                                optSelecionada={'_'}
                                key={index}
                                />
                                <hr className='mx-5 mb-4'/>
                            </>
                        )
                    }
                })}
        </Container>
    );
}
