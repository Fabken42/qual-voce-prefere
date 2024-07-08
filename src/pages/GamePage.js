import { useEffect, useState } from 'react';
import { consultaIDPublicacoesNaoVistas, consultaPublicacaoInfo, consultaTodasPublicacoesIDs, removeIDPublicacaoNaoVista, reiniciaIDPublicacoesNaoVistas, adicionaVotoNaPublicacao } from '../firebase/functions.js';
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/config.js";
import PerguntaCriada from '../components/PerguntaCriada.js';
import { listAll, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config.js';
import { Button, Container } from 'react-bootstrap';

export default function GamePage() {
  const [user] = useAuthState(auth);
  const [idPublicacoesNaoVistas, setIdPublicacoesNaoVistas] = useState([]);
  const [idPublicacaoAnterior, setIdPublicacaoAnterior] = useState('');
  const [publicacaoInfo, setPublicacaoInfo] = useState(null);
  const [imagensURLs, setImagensURLs] = useState();
  const [votou, setVotou] = useState(true);
  const [postagemAtualInvalida, setPostagemAtualInvalida] = useState(false);
  const [visualizouTodasPostagens, setVisualizouTodasPostagens] = useState(false);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('');

  const embaralhaArray = (array) => {
    let currentIndex = array?.length, randomIndex;

    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  const fetchTodosIDsPublicacoesNaoVistas = async () => {
    let res = await consultaTodasPublicacoesIDs();
    res = embaralhaArray(res);
    setIdPublicacoesNaoVistas(res);
  }

  const handleProximaPostagem = async () => {
    if (votou || postagemAtualInvalida) {
      if (user && publicacaoInfo) {
        await adicionaVotoNaPublicacao(idPublicacaoAnterior, opcaoSelecionada);
      }
      setVotou(false);
      setOpcaoSelecionada('');

      if (!idPublicacoesNaoVistas.length) {
        setVisualizouTodasPostagens(true);
        return;
      }

      if (user) {
        await removeIDPublicacaoNaoVista(idPublicacoesNaoVistas[0], user.uid);
      }

      setIdPublicacaoAnterior(idPublicacoesNaoVistas[0]);
      const res = await consultaPublicacaoInfo(idPublicacoesNaoVistas[0]);
      setIdPublicacoesNaoVistas(prevIdPublicacoesNaoVistas => prevIdPublicacoesNaoVistas.slice(1))
      if (!res) {
        setPostagemAtualInvalida(true);
        return;
      }
      setPostagemAtualInvalida(false);
      setPublicacaoInfo(res);
    }
  }

  const handleReinicia = async () => {
    fetchTodosIDsPublicacoesNaoVistas();
    setVisualizouTodasPostagens(false);
    setPublicacaoInfo(null);
    setVotou(true);

    if (user) {
      await reiniciaIDPublicacoesNaoVistas(user.uid);
    }
  }

  const handleVotou = (opt) => {
    setOpcaoSelecionada(opt);
    setVotou(true);
  }

  useEffect(() => {
    if (user) {
      const fetchIDsPublicacoesNaoVistas = async () => {
        let res = await consultaIDPublicacoesNaoVistas(user.uid);
        res = embaralhaArray(res);
        setIdPublicacoesNaoVistas(res);
      }
      fetchIDsPublicacoesNaoVistas()
    } else {
      fetchTodosIDsPublicacoesNaoVistas()
    }
  }, [user])

  useEffect(() => {
    if (postagemAtualInvalida) {
      handleProximaPostagem();
    }
  }, [postagemAtualInvalida])

  useEffect(() => {
    if (publicacaoInfo) {
      const fetchImagensURLs = async () => {
        const imagemListaRef = ref(storage, `images/${publicacaoInfo.autorId}/${publicacaoInfo.data}`);
        const res = await listAll(imagemListaRef);
        const urls = await Promise.all(
          res.items.map(async (item) => {
            return await getDownloadURL(item);
          })
        );
        setImagensURLs(urls);
      };

      fetchImagensURLs();
    }
  }, [publicacaoInfo]);

  const avisoLogin = (
    <div className="alert alert-danger mx-3 mt-4 text-center rounded-pill" role="alert">
      Faça login para criar postagens e ter votos contabilizados!
    </div>
  )

  if (visualizouTodasPostagens) {
    return (
      <>
        {!user && avisoLogin}
        <div className='text-center mt-5 mx-3'>
          <p>Você visualizou todas as postagens disponíveis até o momento. Aguarde por novas postagens, ou reinicie-as clicando no botão abaixo.</p>
          <Button className='rounded-pill' size='lg' onClick={() => handleReinicia()}>Reiniciar</Button>
        </div>
      </>
    )
  }

  if (!publicacaoInfo) {
    return (
      <div className="text-center mt-5 mx-3">
        {!user && avisoLogin}
        <Button onClick={() => handleProximaPostagem()} size='lg' className='rounded-pill'>Comece a jogar!</Button>
      </div>
    )
  }

  return (
    <Container fluid className='text-center mt-3'>
      {!user && avisoLogin}

      <Button onClick={() => handleProximaPostagem()} size='lg' className='rounded-pill' disabled={`${votou ? '' : 'disabled'}`}>Próxima Postagem</Button>

      {publicacaoInfo && <PerguntaCriada
        handleVotou={(opt) => handleVotou(opt)}
        pergunta1={publicacaoInfo.pergunta1}
        pergunta2={publicacaoInfo.pergunta2}
        votos1={publicacaoInfo.votos1}
        votos2={publicacaoInfo.votos2}
        data={publicacaoInfo.data}
        autorId={publicacaoInfo.autorId}
        autorNome={publicacaoInfo.autorNome}
        urlImg1={imagensURLs && imagensURLs[0]}
        urlImg2={imagensURLs && imagensURLs[1]}
        optSelecionada={opcaoSelecionada}
      />}

    </Container>
  )
}

