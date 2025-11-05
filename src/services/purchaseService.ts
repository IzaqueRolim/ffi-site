// src/services/purchaseService.ts
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Purchase } from "../types/Purchase";
import { addHistoric } from "./historicoService";
import { getFormattedDate } from "../utils/dateFormated";

const purchasesCollection = collection(db, "purchases");

// Criar uma nova compra
export async function addPurchase(purchase: Purchase) {
  await addDoc(purchasesCollection, purchase);
  addHistoric({ action:`${purchase.quantity} compras(s) de ${purchase.item} por R$${purchase.price}`,
                  date: getFormattedDate(),
                  user:"Izaque"})
  console.log("Compra adicionada:", purchase);
}

// Ler todas as compras
export async function getPurchases(): Promise<Purchase[]> {
  const snapshot = await getDocs(purchasesCollection);
  const list: Purchase[] = snapshot.docs.map((doc) => ({
    docId:doc.id,
    id: doc.data().id,
    date: doc.data().date,
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
