// src/services/purchaseService.ts
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Idea } from "../types/Idea";
import { storage } from "../firebaseConfig"; // Importe sua instância de storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
  import { addHistoric } from "./historicoService";

/**
 * Envia um arquivo para o Firebase Storage e retorna a URL de download.
 * @param file O objeto File a ser enviado.
 * @param path O caminho dentro do Storage (ex: 'ideias/').
 * @returns Promise<string> A URL de download do arquivo.
 */
export async function uploadFileToStorage(file: File, path: string): Promise<string> {
  // Cria um nome de arquivo único para evitar colisões
  const uniqueFileName = `${path}${file.name}-${Date.now()}`;
  const storageRef = ref(storage, uniqueFileName);

  // Usa uploadBytesResumable para lidar com o upload do Blob/File
  const uploadTask = uploadBytesResumable(storageRef, file);

  // Retorna uma Promise que resolve com a URL de download
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed', 
      (snapshot) => {
        // Opcional: Aqui você pode adicionar lógica para monitorar o progresso
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress.toFixed(0) + '% done');
      }, 
      (error) => {
        // Erro no upload
        console.error("Erro no upload do arquivo:", error);
        reject(error);
      }, 
      () => {
        // Upload concluído! Obtém a URL de download
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        }).catch(reject);
      }
    );
  });
}
const ideaCollection = collection(db, "idea");

// Criar uma nova compra
export async function addIdea(idea: Idea) {
  await addDoc(ideaCollection, idea);
   addHistoric({ action:`Adicionou a ideia: ${idea.title}`,
                    date: new Date(),
                    user:"Izaque"})
  console.log("Ideia adicionada:", idea);
}

// Ler todas as compras
export async function getIdea(): Promise<Idea[]> {
  const snapshot = await getDocs(ideaCollection);
  const list: Idea[] = snapshot.docs.map((doc) => ({
    id: doc.data().id,
    docId:doc.id,
    title: doc.data().title,
    description: doc.data().description,
    images: doc.data().images
  }));
  return list;
}
