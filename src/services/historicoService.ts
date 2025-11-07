// src/services/purchaseService.ts
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Historic } from "../types/Historico";

const historicCollection = collection(db, "historic");

// Criar uma nova compra
export async function addHistoric(historic: Historic) {
  await addDoc(historicCollection, historic);
  console.log("Historico adicionada:", historic);
}

// Ler todas as compras
export async function getHistoric(): Promise<Historic[]> {
  const snapshot = await getDocs(historicCollection);
  const list: Historic[] = snapshot.docs.map((doc) => ({
    docId:doc.id,
    id: doc.data().id,
    action:doc.data().action,
    date:doc.data().date.toDate(),
    user:doc.data().user,
  }));
  return list;
}
