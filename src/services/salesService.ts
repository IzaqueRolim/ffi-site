// src/services/purchaseService.ts
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore"; // Importe deleteDoc e doc
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

export async function deleteSale(docId: string): Promise<void> {
  // 1. Cria uma referência ao documento usando o ID do Firestore
  const saleDocRef = doc(db, "sale", docId); 
  
  try {
    // 2. Busca os dados do documento ANTES de deletar
    const docSnapshot = await getDoc(saleDocRef);

    if (docSnapshot.exists()) {
      const saleData = docSnapshot.data() as Sale;
      
      // 3. Registra a exclusão no histórico usando os dados da venda
      await addHistoric({ 
        action: `Excluiu a venda do cliente: ${saleData.client} (Produto: ${saleData.product}, Valor: R$ ${saleData.price})`,
        date: getFormattedDate(),
        user:"Izaque"
      });

      // 4. Deleta o documento
      await deleteDoc(saleDocRef); 

      console.log("Venda excluída e histórico registrado:", docId);

    } else {
      console.log("Documento de venda não encontrado para exclusão:", docId);
      // Opcional: Tentar deletar mesmo assim, ou retornar um erro
      await deleteDoc(saleDocRef); 
    }

  } catch (error) {
    console.error("Erro ao excluir a venda ou registrar no histórico:", error);
    throw error; // Propaga o erro para quem chamou a função
  }
}