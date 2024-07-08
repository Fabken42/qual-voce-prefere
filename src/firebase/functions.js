import { db } from './config.js'
import { addDoc, collection, getDoc, updateDoc, doc, setDoc, arrayUnion, getDocs, arrayRemove, increment, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config.js';

export const adicionaPegunta = async (opcoes, user, data) => {
    try {
        const docRef = await addDoc(collection(db, "publicacoes-total"), {
            pergunta1: opcoes.textoOpcao1,
            pergunta2: opcoes.textoOpcao2,
            autorNome: user.displayName,
            autorId: user.uid,
            data: data,
            votos1: 0,
            votos2: 0
        });
        return docRef;
    } catch (error) {
        console.log(error);
    }
}

export const consultaUIDsCadastrados = async () => {
    const outrosRef = doc(db, "outros", "outros");
    const outrosSnaphot = await getDoc(outrosRef);
    return outrosSnaphot.data().cadastrosUIDs;
}

export const atualizaUIDsCadastrados = async (novoCadastrosUIDs) => {
    const outrosRef = doc(db, 'outros', 'outros')
    try {
        await updateDoc(outrosRef, {
            cadastrosUIDs: novoCadastrosUIDs,
        })
    } catch (error) {
        console.log(error);
    }
}

export const consultaTodasPublicacoesIDs = async () => {
    const outrosRef = doc(db, 'outros', 'outros')
    try {
        const outrosSnaphot = await getDoc(outrosRef);
        return outrosSnaphot.data().todasPublicacoesIDs;
    } catch (error) {
        console.log(error);
    }
}

export const adicionaPublicacaoID = async (novaPublicacaoID) => {
    const outrosRef = doc(db, 'outros', 'outros')

    try {
        await updateDoc(outrosRef, {
            todasPublicacoesIDs: arrayUnion(novaPublicacaoID)
        })
    } catch (error) {
        console.log(error);
    }
}

export const removePublicacaoID = async (publicacaoID) => {
    const outrosRef = doc(db, 'outros', 'outros')

    try {
        await updateDoc(outrosRef, {
            todasPublicacoesIDs: arrayRemove(publicacaoID)
        })
    } catch (error) {
        console.log(error);
    }
}

export const criaUsuario = async (uid, username) => {
    const todasPublicacoesIDs = await consultaTodasPublicacoesIDs();
    await setDoc(doc(db, 'usuarios', uid), {
        nomeUsuario: username,
        idPublicacoesNaoVistas: todasPublicacoesIDs,
        dataUltimaPublicacao: 1,
        idPublicacoesCriadas: []
    })
}

export const reiniciaIDPublicacoesNaoVistas = async (uid) => {
    const usuarioRef = doc(db, "usuarios", uid);
    const todasPublicacoesIDs = await consultaTodasPublicacoesIDs();

    await updateDoc(usuarioRef, {
        idPublicacoesNaoVistas: todasPublicacoesIDs
    })
}

export const consultaDataUltimaPublicacao = async (userId) => {
    const publicacoesRef = doc(db, "usuarios", userId)

    try {
        const publicacoesSnapshot = await getDoc(publicacoesRef);
        return publicacoesSnapshot.data().dataUltimaPublicacao;
    } catch (error) {
        console.log(error);
    }
}

export const alteraDataUltimaPublicacao = async (userId, data) => { 
    try {
        const usuarioRef = doc(db, "usuarios", userId);
        await updateDoc(usuarioRef, {
            dataUltimaPublicacao: data
        })
    } catch (error) {
        console.log(error);
    }
}

export const consultaIDPublicacoesCriadas = async (uid) => {
    try {
        const usuarioRef = doc(db, 'usuarios', uid);
        const usuarioSnapshot = await getDoc(usuarioRef);
        return usuarioSnapshot.data().idPublicacoesCriadas;
    } catch (error) {
        console.log(error);
    }
}

export const adicionaIDPublicacoesCriadas = async (uid, publicacaoId) => {
    try {
        const usuarioRef = doc(db, "usuarios", uid);
        await updateDoc(usuarioRef, {
            idPublicacoesCriadas: arrayUnion(publicacaoId)
        });
        console.log("ID da publicação adicionado com sucesso!");
    } catch (error) {
        console.error("Erro ao adicionar ID da publicação:", error);
    }
};

export const excluiIDPublicacaoCriada = async (uid, publicacaoId, data) => {
    try {
        const usuarioRef = doc(db, "usuarios", uid);
        const publicacoesTotalRef = doc(db, "publicacoes-total",publicacaoId);

        await updateDoc(usuarioRef, {
            idPublicacoesCriadas: arrayRemove(publicacaoId)
        });
        await deleteDoc(publicacoesTotalRef);
        await removePublicacaoID(publicacaoId);

        const img1Ref = ref(storage, `images/${uid}/${data}/1`);
        const img2Ref = ref(storage, `images/${uid}/${data}/2`);
        await deleteObject(img1Ref);
        await deleteObject(img2Ref);

        window.alert("ID da publicação removido com sucesso. Recarregue a página!");
    } catch (error) {
        console.error("Erro ao adicionar ID da publicação:", error);
    }
}

export const consultaIDPublicacoesNaoVistas = async (uid) => {
    try {
        const usuarioRef = doc(db, "usuarios", uid);
        const usuarioSnapshot = await getDoc(usuarioRef);
        return usuarioSnapshot.data().idPublicacoesNaoVistas;
    } catch (error) {
        console.log(error);
    }
}

const adicionaIDPublicacaoNaoVista = async (publicacaoId, uid) => {
    try {
        const usuarioRef = doc(db, "usuarios", uid);
        await updateDoc(usuarioRef, {
            idPublicacoesNaoVistas: arrayUnion(publicacaoId)
        })
    } catch (error) {
        console.log(error);
    }
}
export const removeIDPublicacaoNaoVista = async (publicacaoId, uid) => {
    try {
        const usuarioRef = doc(db, "usuarios", uid);
        await updateDoc(usuarioRef, {
            idPublicacoesNaoVistas: arrayRemove(publicacaoId)
        })

    } catch (error) {
        console.log(error);
    }
}

export const adicionaIDPublicacaoNaoVistaParaTodos = async (publicacaoId) => {
    const usuariosRef = collection(db, "usuarios");
    const usuariosSnapshot = await getDocs(usuariosRef);

    usuariosSnapshot.forEach((doc) => {
        adicionaIDPublicacaoNaoVista(publicacaoId, doc.id);
    })
}

export const consultaPublicacaoInfo = async (publicacaoId) => {
    try {
        const publicacaoRef = doc(db, "publicacoes-total", publicacaoId);
        const publicacaoSnapshot = await getDoc(publicacaoRef);
        return publicacaoSnapshot.data();
    } catch (error) {
        console.log(error);
    }
}

export const adicionaVotoNaPublicacao = async (publicacaoId, opt) => {
    try {
        const usuarioRef = doc(db, 'publicacoes-total', publicacaoId);
        if (opt === 'opt1') {
            await updateDoc(usuarioRef, {
                votos1: increment(1)
            })
        } else if (opt === 'opt2') {
            await updateDoc(usuarioRef, {
                votos2: increment(1)
            })
        }

    } catch (error) {
        console.log(error);
    }
}