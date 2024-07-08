import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { auth, storage } from '../firebase/config.js';
import { ref, uploadBytes } from 'firebase/storage';
import { 
    adicionaIDPublicacoesCriadas, 
    adicionaPublicacaoID, 
    adicionaIDPublicacaoNaoVistaParaTodos, 
    adicionaPegunta, 
    alteraDataUltimaPublicacao, 
    consultaDataUltimaPublicacao, 
    consultaIDPublicacoesCriadas 
} from '../firebase/functions.js';
import { useAuthState } from "react-firebase-hooks/auth";
import { handleSuccess, handleError } from '../utils.js';

export default function CriaPergunta({ adicionarPublicacaoCriada }) {
    const SEGUNDOS_PARA_PROXIMA_POSTAGEM = 180; // 180 segundos
    const [user] = useAuthState(auth);
    const [opcoes, setOpcoes] = useState({
        textoOpcao1: '',
        textoOpcao2: '',
        imagemOpcao1: null,
        imagemOpcao2: null
    });
    const [podeCriarPergunta, setPodeCriarPergunta] = useState(false);
    const [dataUltimaPublicacao, setDataUltimaPublicacao] = useState(null);
    const [segundosParaProximaPublicacao, setSegundosParaProximaPublicacao] = useState(null);

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        if (podeCriarPergunta) {
            if ((!opcoes.textoOpcao1.length) || (!opcoes.textoOpcao2.length) || (!opcoes.imagemOpcao1) || (!opcoes.imagemOpcao2)) {
                handleError("Preencha todos os campos!");
                return;
            }
            if (opcoes.textoOpcao1.length > 50 || opcoes.textoOpcao2.length > 50) {
                handleError("Campos de texto devem ter no máximo 50 caracteres!");
                return;
            }
            const idPublicacoesCriadas = await consultaIDPublicacoesCriadas(user.uid);
            if (idPublicacoesCriadas.length >= 30) {
                handleError('Você atingiu o limite de publicações criadas. Exclua publicações antigas para adicionar novas!');
                return;
            }

            const data = new Date().getTime();
            if (opcoes.imagemOpcao1) {
                const imgRef1 = ref(storage, `images/${user.uid}/${data}/1`);
                await uploadBytes(imgRef1, opcoes.imagemOpcao1);
            }
            if (opcoes.imagemOpcao2) {
                const imgRef2 = ref(storage, `images/${user.uid}/${data}/2`);
                await uploadBytes(imgRef2, opcoes.imagemOpcao2);
            }

            const handleAdicionarPergunta = async (opcoes, user, data) => {
                try {
                    setDataUltimaPublicacao(data);
                    const docRef = await adicionaPegunta(opcoes, user, data);
                    const path = docRef.path;
                    const imgId = path.split("publicacoes-total/")[1];
                    await adicionaPublicacaoID(imgId);
                    await alteraDataUltimaPublicacao(user.uid, data);
                    await adicionaIDPublicacoesCriadas(user.uid, imgId);
                    await adicionaIDPublicacaoNaoVistaParaTodos(imgId);
                    await adicionarPublicacaoCriada(imgId);
                    handleSuccess("Postagem criada com sucesso!");
                } catch (error) {
                    console.error("Erro ao adicionar pergunta:", error);
                }
            };
            handleAdicionarPergunta(opcoes, user, data);
        }
    };

    useEffect(() => {
        const fetchDataUltimaPublicacao = async () => {
            const dataUltimaPublicacao = await consultaDataUltimaPublicacao(user.uid);
            setDataUltimaPublicacao(dataUltimaPublicacao);
        };
        if (user) fetchDataUltimaPublicacao();
    }, [user]);

    useEffect(() => {
        if (dataUltimaPublicacao) {
            const intervalo = setInterval(() => {
                const segundosUltimaPostagem = (new Date().getTime() - dataUltimaPublicacao) / 1000;

                if (segundosUltimaPostagem >= SEGUNDOS_PARA_PROXIMA_POSTAGEM) {
                    setPodeCriarPergunta(true);
                    setSegundosParaProximaPublicacao(null);
                    clearInterval(intervalo);
                } else {
                    setPodeCriarPergunta(false);
                    setSegundosParaProximaPublicacao((SEGUNDOS_PARA_PROXIMA_POSTAGEM - segundosUltimaPostagem).toFixed(0));
                }
            }, 1000);

            return () => clearInterval(intervalo);
        }
    }, [dataUltimaPublicacao]);

    return (
        <Container>
            <Row xs={12}>
                <h2 className="text-center text-primary mx-5 my-4 text-uppercase rounded-pill bg-light p-3 shadow">Criar Pergunta</h2>
            </Row>
            <Row xs={12}>
                {segundosParaProximaPublicacao && (
                    <div className="rounded-pill alert alert-danger mx-5 mt-2 text-center" role="alert">
                        Você poderá criar uma nova postagem em {Math.floor(segundosParaProximaPublicacao)} segundo(s).
                    </div>
                )}
            </Row>
            <Form onSubmit={handleSubmit}>
                <Row className="justify-content-center">
                    <Col xs={5} className="d-flex flex-column align-items-end">
                        <div className="form-group my-2 w-75">
                            <label htmlFor="alternativa1" className="mb-1">Alternativa 1:</label>
                            <input
                                type="text"
                                id="alternativa1"
                                className="form-control rounded-pill"
                                placeholder="ex.: Ser um bom cantor"
                                onChange={(ev) => setOpcoes({ ...opcoes, textoOpcao1: ev.target.value })}
                            />
                        </div>
                        <div className="form-group my-2 w-75">
                            <label htmlFor="imagem1" className="mb-1">Imagem 1:</label>
                            <input
                                type="file"
                                id="imagem1"
                                className="form-control rounded-pill"
                                onChange={(ev) => setOpcoes({ ...opcoes, imagemOpcao1: ev.target.files[0] })}
                            />
                        </div>
                    </Col>
                    <Col xs={1} className="d-flex align-items-center justify-content-center">
                        <span className="position-relative fs-5 rounded-circle bg-dark text-light p-3">OU</span>
                    </Col>
                    <Col xs={5} className="d-flex flex-column align-items-start">
                        <div className="form-group my-2 w-75">
                            <label htmlFor="alternativa2" className="mb-1">Alternativa 2:</label>
                            <input
                                type="text"
                                id="alternativa2"
                                className="form-control rounded-pill"
                                placeholder="ex.: Ser um bom dançarino"
                                onChange={(ev) => setOpcoes({ ...opcoes, textoOpcao2: ev.target.value })}
                            />
                        </div>
                        <div className="form-group my-2 w-75">
                            <label htmlFor="imagem2" className="mb-1">Imagem 2:</label>
                            <input
                                type="file"
                                id="imagem2"
                                className="form-control rounded-pill"
                                onChange={(ev) => setOpcoes({ ...opcoes, imagemOpcao2: ev.target.files[0] })}
                            />
                        </div>
                    </Col>
                </Row>
                <Row className='justify-content-center'>
                    <Button type="submit" size="lg" className={`w-25 rounded-pill ${podeCriarPergunta ? '' : 'disabled'} mt-3`}>
                        Enviar
                    </Button>
                </Row>
            </Form>
        </Container>
    );
}
