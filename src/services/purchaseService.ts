// src/services/purchaseService.ts
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Purchase } from "../types/Purchase";
import { addHistoric } from "./historicoService";

const purchasesCollection = collection(db, "purchases");

// Criar uma nova compra
export async function addPurchase(purchase: Omit<Purchase, 'docId'>) {
  await addDoc(purchasesCollection, purchase);
  addHistoric({ action:`${purchase.quantity} compras(s) de ${purchase.item} por R$${purchase.price}`,
                  date: new Date(),
                  user:"Izaque"})
  console.log("Compra adicionada:", purchase);
}


const rawPurchaseData: Omit<Purchase, 'docId'>[] = [
  { id: 1, date: new Date('07/30/2025'), item: 'PETG branco voolts 3d', store: '3DH / Voolts', quantity: 1000, price: 134.00, payment: 'Pix' },
  { id: 2, date: new Date('08/03/2025'), item: 'pla verde 3DFILA', store: '3DH', quantity: 1000, price: 126.00, payment: 'Pix' },
  { id: 3, date: new Date('08/03/2025'), item: 'pla preto voolts 3d', store: 'Amazon', quantity: 1000, price: 129.00, payment: 'Pix' },
  { id: 4, date: new Date('08/03/2025'), item: 'pla dourado voolts 3d', store: 'Amazon', quantity: 1000, price: 129.00, payment: 'Pix' },
  { id: 5, date: new Date('08/03/2025'), item: 'pla vemelho voolts 3d', store: 'Amazon', quantity: 1000, price: 119.00, payment: 'Pix' },
  { id: 6, date: new Date('08/03/2025'), item: 'pla azul voolts 3d', store: 'Amazon', quantity: 1000, price: 123.00, payment: 'Pix' },
  { id: 7, date: new Date('08/03/2025'), item: 'Argola chaveiro', store: 'N/A', quantity: 100, price: 16.00, payment: 'Pix' },
  { id: 8, date: new Date('08/03/2025'), item: 'pla azul 3dfila', store: '3DH', quantity: 1000, price: 125.00, payment: 'Pix' },
  { id: 9, date: new Date('08/03/2025'), item: 'Filamento voolts branco', store: '3DH', quantity: 1000, price: 125.00, payment: 'Pix' },
  { id: 10, date: new Date('08/03/2025'), item: 'Argola chaveiro', store: 'N/A', quantity: 100, price: 30.00, payment: 'Pix' },
  { id: 11, date: new Date('08/03/2025'), item: 'Imã 6x2mm', store: 'N/A', quantity: 100, price: 35.00, payment: 'Pix' },
  { id: 12, date: new Date('08/03/2025'), item: 'pincel', store: 'N/A', quantity: 5, price: 20.00, payment: 'Pix' },
  { id: 13, date: new Date('08/03/2025'), item: 'Fita led', store: 'N/A', quantity: 1, price: 85.00, payment: 'Pix' },
];


export async function importPurchasesFromExcelData() {
    console.log(`Iniciando importação de ${rawPurchaseData.length} compras...`);

    for (const purchase of rawPurchaseData) {
        try {
            await addPurchase(purchase); 
            // Opcional: Adicione um pequeno delay aqui se for importar milhares de itens
        } catch (error) {
            console.error(`Erro ao adicionar compra ID ${purchase.id} (${purchase.item}):`, error);
        }
    }
    console.log("Processo de importação de compras concluído.");
}




// Ler todas as compras
export async function getPurchases(): Promise<Purchase[]> {

  const q = query(purchasesCollection, orderBy("date", "desc"));
  
  const snapshot = await getDocs(q);
  const list: Purchase[] = snapshot.docs.map((doc) => ({
    docId:doc.id,
    id: doc.data().id,
    date: doc.data().date.toDate(),
    item: doc.data().item,
    price: doc.data().price,
    quantity: doc.data().quantity,
    store: doc.data().store,
    payment: doc.data().payment,
  }));
  return list;
}

export async function deletePurchase(docId: string): Promise<void> {
  const purchaseDoc = doc(db, "purchases", docId); 
  // Deleta o documento
  await deleteDoc(purchaseDoc); 
  console.log("Compra excluída:", docId);
}
