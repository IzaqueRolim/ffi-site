// src/services/purchaseService.ts
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Sale } from "../types/Sales";

const salesCollection = collection(db, "sale");

// Criar uma nova compra
export async function addSale(sale: Sale) {
  await addDoc(salesCollection, sale);
  console.log("Venda adicionada:", sale);
}

// Ler todas as compras
export async function getSale(): Promise<Sale[]> {
  const snapshot = await getDocs(salesCollection);
  const list: Sale[] = snapshot.docs.map((doc) => ({
    id: doc.data().id,
    date: doc.data().date,
    product: doc.data().product,
    price: doc.data().price,
    client: doc.data().client,
    category: doc.data().category,
    origin: doc.data().origin
  }));
  return list;
}
