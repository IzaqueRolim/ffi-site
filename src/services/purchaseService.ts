// src/services/purchaseService.ts
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Purchase } from "../types/Purchase";

const purchasesCollection = collection(db, "purchases");

// Criar uma nova compra
export async function addPurchase(purchase: Purchase) {
  await addDoc(purchasesCollection, purchase);
  console.log("Compra adicionada:", purchase);
}

// Ler todas as compras
export async function getPurchases(): Promise<Purchase[]> {
  const snapshot = await getDocs(purchasesCollection);
  const list: Purchase[] = snapshot.docs.map((doc) => ({
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
