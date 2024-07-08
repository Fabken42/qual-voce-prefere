import { Card, Row, Col, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { excluiIDPublicacaoCriada } from "../firebase/functions";

export default function PerguntaCriada({ handleVotou, pergunta1, pergunta2, votos1, votos2, data, autorId, autorNome, urlImg1, urlImg2, publicacaoId, optSelecionada, mostrarLixeira }) {
    const dataCriacao = new Date(data).toLocaleString(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' });
    let porcentagemVotos1 = ((votos1 * 100) / (votos1 + votos2)).toFixed(0);
    if (isNaN(porcentagemVotos1)) porcentagemVotos1 = 0;

    const excluiPublicacao = () => {
        const excluiIDPublicacao = async () => {
            await excluiIDPublicacaoCriada(autorId, publicacaoId, data);
        }
        if (window.confirm("Deseja excluir esta publicação?")) excluiIDPublicacao()
    }

    return (
        <>
            <Card className="m-3 card-opt">
                <Card.Body className="bg-black text-white rounded">
                    <Row className="m-0">
                        {/* Bloco da Esquerda */}
                        <Col onClick={handleVotou ? () => handleVotou('opt1') : undefined} md={12} lg={6} className={`col-esquerda rounded d-flex flex-column align-items-center justify-content-center pt-2 bg-vermelho ${optSelecionada === 'opt1' ? 'opt1--selecionado' : ''}`}>
                            <p className='pt-2'>{pergunta1}</p>
                            <img src={urlImg1} alt="Imagem Esquerda" className="rounded img-opt" />
                            <p className="pt-2">{optSelecionada ? `${porcentagemVotos1}% (${votos1} votos)` : ''}</p>
                        </Col>
                        {/* Bloco da Direita */}
                        <Col onClick={handleVotou ? () => handleVotou('opt2') : undefined} md={12} lg={6} className={`col-direita rounded d-flex flex-column align-items-center justify-content-center pt-2 bg-azul ${optSelecionada === 'opt2' ? 'opt2--selecionado' : ''}`}>
                            <p className='pt-2'>{pergunta2}</p>
                            <img src={urlImg2} alt="Imagem Direita" className="rounded img-opt" />
                            <p className="pt-2">{optSelecionada ? `${100 - porcentagemVotos1}% (${votos2} votos)` : ''}</p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            <div className="d-flex align-items-start justify-content-center gap-2">
                <h5 className="text-muted text-center mb-2">{`${autorNome ? `Criado por: ${autorNome}` : ''} (${dataCriacao})`}</h5>
                {mostrarLixeira && <FontAwesomeIcon icon={faTrash} size='xl' className="logo-lixeira" onClick={() => excluiPublicacao()} />}
            </div>
        </>
    );
}