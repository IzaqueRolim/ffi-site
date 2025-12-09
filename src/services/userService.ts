// src/services/purchaseService.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Importe deleteDoc e doc
import { db } from "../firebaseConfig";
import { query, where, getDocs } from "firebase/firestore";
import bcrypt from "bcryptjs";

import { addHistoric } from "./historicoService";
import type { User } from "../types/User";


const userCollection = collection(db, "user");


export async function addUser(user: Omit<User, 'docId'>) {
  await addDoc(userCollection, user);
  addHistoric({ action:`${user.userName} logou`,
                date: new Date(),
                user:"Izaque"})
  console.log("Venda adicionada:", user);
}


export async function sendLogin(email: string, password: string): Promise<User> {
  // Busca usuário pelo email
  const q = query(userCollection, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Usuário não encontrado");
  }

  const userDoc = snapshot.docs[0];
  const user = userDoc.data() as User;

  // Compara senha digitada com a senha criptografada salva no banco
  const senhaValida = await bcrypt.compare(password, user.password);

  if (!senhaValida) {
    throw new Error("Senha inválida");
  }

  alert("Login")

  return {
    ...user,
    docId: userDoc.id,
  };
}

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  permissions?: string[];
}

export async function registerUser(data: RegisterUserDTO) {
  const { name, email, password, permissions = ["user"] } = data;

  // ✅ Verifica se já existe usuário com esse email
  const q = query(collection(db, "user"), where("email", "==", email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    throw new Error("Esse email já está cadastrado");
  }

  // ✅ Criptografa a senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ Cria usuário no Firestore
  const docRef = await addDoc(collection(db, "user"), {
    name,
    email,
    password: hashedPassword,
    permissions,
    createdAt: serverTimestamp(),
    lastLogin: null,
  });


  return {
    docId: docRef.id,
    name,
    email,
    permissions,
  };
}