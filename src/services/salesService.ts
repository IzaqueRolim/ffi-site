// src/services/purchaseService.ts
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"; // Importe deleteDoc e doc
import { db } from "../firebaseConfig";
import type { Sale } from "../types/Sales";
import { addHistoric } from "./historicoService";
import { getFormattedDate } from "../utils/dateFormated";


const salesCollection = collection(db, "sale");

// Criar uma nova venda (Sem alteração)
export async function addSale(sale: Omit<Sale, 'docId'>) {
  await addDoc(salesCollection, sale);
  addHistoric({ action:`${sale.quantity} venda(s) de ${sale.product} por R$${sale.price}`,
                date: getFormattedDate(),
                user:"Izaque"})
  console.log("Venda adicionada:", sale);
}

// Ler todas as vendas (Alterado para incluir o 'docId' do Firestore)
export async function getSale(): Promise<Sale[]> {
  const snapshot = await getDocs(salesCollection);
  const list: Sale[] = snapshot.docs.map((doc) => ({
    // ATENÇÃO: Usamos doc.id para o ID do Firebase
    docId: doc.id, 
    id: doc.data().id, // Seu ID original (assumindo que existe)
    date: doc.data().date,
    product: doc.data().product,
    price: doc.data().price,
    client: doc.data().client,
    category: doc.data().category,
    origin: doc.data().origin,
    // Adicione um 'as unknown as Sale' se tiver problemas com a tipagem
  })) as Sale[];
  return list;
}

// 🆕 EXCLUIR uma venda (NOVA FUNÇÃO)
export async function deleteSale(docId: string): Promise<void> {
  // Cria uma referência ao documento usando o ID do Firestore
  const saleDoc = doc(db, "sale", docId); 
  // Deleta o documento
  await deleteDoc(saleDoc); 
  console.log("Venda excluída:", docId);
}