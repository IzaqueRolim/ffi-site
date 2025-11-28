// src/services/purchaseService.ts
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, orderBy, query } from "firebase/firestore"; // Importe deleteDoc e doc
import { db } from "../firebaseConfig";
import type { Sale } from "../types/Sales";
import { addHistoric } from "./historicoService";


const salesCollection = collection(db, "sale");


const rawData: Omit<Sale, 'docId'>[] = [ 
  { id: 1, date: new Date('08/04/2025'), client: 'Iolene', product: 'Letreiro "Santa Ceia"', quantity: 1, price: 40.00, materialCost: 11.27, category: "Letreiro", origin: "Boca a Boca" },
  { id: 2, date: new Date('08/07/2025'), client: 'Irma Maria', product: 'Chaveiro "Melhor Pai"', quantity: 7, price: 3.00, materialCost: 1.05, category: "Chaveiro", origin: "Boca a Boca" },
  { id: 3, date: new Date('08/08/2025'), client: 'Liliane', product: 'Chaveiro Varios Nomes', quantity: 13, price: 5.00, materialCost: 1.01, category: "Chaveiro", origin: "Boca a Boca" },
  { id: 4, date: new Date('08/08/2025'), client: 'Geise', product: 'Chaveiro "Adao Paizao"', quantity: 1, price: 7.00, materialCost: 1.01, category: "Chaveiro", origin: "Boca a Boca" },
  { id: 5, date: new Date('08/09/2025'), client: 'Pastora Juci', product: 'Chaveiros Trofeu Melhor Pai', quantity: 25, price: 3.50, materialCost: 1.05, category: "Chaveiro", origin: "Boca a Boca" },
  { id: 6, date: new Date('08/08/2025'), client: 'Banca Rita', product: 'Placa Pai eu te amo', quantity: 1, price: 20.00, materialCost: 3.29, category: "Letreiro", origin: "Banca" },
  { id: 7, date: new Date('08/09/2025'), client: 'Alexandra Canavarro', product: 'Chaveiros Trofeu Melhor Pai', quantity: 30, price: 3.50, materialCost: 1.09, category: "Chaveiro", origin: "Boca a Boca" },
  { id: 8, date: new Date('08/09/2025'), client: 'Jobson', product: 'Placa Pai eu te amo', quantity: 1, price: 20.00, materialCost: 3.29, category: "Letreiro", origin: "Boca a Boca" },
  { id: 9, date: new Date('08/10/2025'), client: 'Raquel Rolim', product: 'Estatua pai e filha', quantity: 1, price: 30.00, materialCost: 2.41, category: "Bonecos", origin: "Boca a Boca" },
  { id: 10, date: new Date('08/10/2025'), client: 'Geise', product: 'Placa Pai eu te amo', quantity: 1, price: 20.00, materialCost: 3.29, category: "Letreiro", origin: "Boca a Boca" },
  { id: 11, date: new Date('09/01/2025'), client: 'Larissa', product: 'Letreiro "Santa Ceia"', quantity: 1, price: 45.00, materialCost: 5.09, category: "Letreiro", origin: "Boca a Boca" },
  { id: 12, date: new Date('09/01/2025'), client: 'Andryws', product: 'Mascara Scorpion', quantity: 1, price: 20.00, materialCost: 8.87, category: "Cosplay", origin: "Boca a Boca" },
  { id: 13, date: new Date('09/16/2025'), client: 'Andryws', product: 'Espada', quantity: 1, price: 100.00, materialCost: 70.20, category: "Cosplay", origin: "Boca a Boca" },
  { id: 14, date: new Date('09/16/2025'), client: 'Andryws', product: 'Suporte alexa', quantity: 1, price: 55.00, materialCost: 29.84, category: "Suportes", origin: "Boca a Boca" },
  { id: 15, date: new Date('09/16/2025'), client: 'Thaynara', product: 'Sonic', quantity: 1, price: 80.00, materialCost: 0.00, category: "Bonecos", origin: "Boca a Boca" },
  { id: 16, date: new Date('09/16/2025'), client: 'Prima da Raquel', product: 'Suporte Celular', quantity: 1, price: 30.00, materialCost: 7.80, category: "Organizadores", origin: "Boca a Boca" },
  { id: 17, date: new Date('09/17/2025'), client: 'Cliente Da OLX', product: 'Luminária Botafoto', quantity: 1, price: 120.00, materialCost: 0.00, category: "Luminária", origin: "OLX" },
  { id: 18, date: new Date('09/24/2025'), client: 'Myrella', product: 'Letreiro Yara', quantity: 1, price: 30.00, materialCost: 0.00, category: "Letreiro", origin: "Boca a Boca" },
  { id: 19, date: new Date('09/24/2025'), client: 'Vitor', product: 'Mascara homem aranha', quantity: 1, price: 130.00, materialCost: 0.00, category: "Cosplay", origin: "Boca a Boca" },
  { id: 20, date: new Date('09/24/2025'), client: 'Cecilia', product: 'Suporte celular fone', quantity: 1, price: 40.00, materialCost: 0.00, category: "Organizadores", origin: "Boca a Boca" },
  { id: 21, date: new Date('09/24/2025'), client: 'Emanuel', product: 'Porta Lapis Sueter', quantity: 1, price: 35.00, materialCost: 0.00, category: "Organizadores", origin: "Boca a Boca" },
  { id: 22, date: new Date('09/24/2025'), client: 'Erika', product: 'Porta Lapis Vestido', quantity: 1, price: 15.00, materialCost: 0.00, category: "Organizadores", origin: "Boca a Boca" },
  { id: 23, date: new Date('10/01/2025'), client: 'Eduardo', product: 'Mao suporte Controle', quantity: 1, price: 60.00, materialCost: 15.00, category: "Suportes", origin: "Boca a Boca" },
  { id: 24, date: new Date('10/02/2025'), client: 'Cliente Instagram', product: 'Espada Final Fantasy', quantity: 1, price: 40.00, materialCost: 0.00, category: "Cosplay", origin: "Instagram" },
  { id: 25, date: new Date('10/02/2025'), client: 'Rosy', product: 'Medalha Corrida Das Estações', quantity: 1, price: 15.00, materialCost: 0.00, category: "Medalha", origin: "Boca a Boca" },
  { id: 26, date: new Date('09/30/2025'), client: 'Samuel', product: 'Bonequinho Miniatura Samuel Ester', quantity: 1, price: 100.00, materialCost: 0.00, category: "Boneco Personalizado", origin: "Boca a Boca" },
  { id: 27, date: new Date('10/05/2025'), client: 'Joao Bernardo', product: 'Coroa Avatar Shori', quantity: 1, price: 20.00, materialCost: 0.00, category: "Cosplay", origin: "Boca a Boca" },
  { id: 28, date: new Date('09/29/2025'), client: 'Amiga da Raquel', product: 'Medalha EBF', quantity: 2, price: 10.00, materialCost: 0.00, category: "Medalha", origin: "Boca a Boca" },
  { id: 29, date: new Date('11/08/2025'), client: 'Neia', product: 'Letreiro "Cantinho do Café"', quantity: 1, price: 40.00, materialCost: 6.00, category: "Letreiro", origin: "Boca a Boca" },
  { id: 30, date: new Date('11/08/2025'), client: 'Neia', product: 'Letreiro "Cantinho do Café"', quantity: 1, price: 40.00, materialCost: 6.00, category: "Letreiro", origin: "Boca a Boca" },
];


export async function importSalesFromExcelData() {
    console.log(`Iniciando importação de ${rawData.length} vendas...`);

    for (const sale of rawData) {
        try {
            // Chamada à sua função original
            await addSale(sale); 
            
            // Pequeno delay para evitar sobrecarga (opcional, mas recomendado para muitos docs)
            // await new Promise(resolve => setTimeout(resolve, 50)); 

        } catch (error) {
            console.error(`Erro ao adicionar venda ID ${sale.id} (${sale.product}):`, error);
        }
    }
    console.log("Processo de importação concluído.");
}
export async function addSale(sale: Omit<Sale, 'docId'>) {
  await addDoc(salesCollection, sale);
  addHistoric({ action:`${sale.quantity} venda(s) de ${sale.product} por R$${sale.price}`,
                date: new Date(),
                user:"Izaque"})
  console.log("Venda adicionada:", sale);
}

export async function getSale(): Promise<Sale[]> {
  const q = query(salesCollection, orderBy("date", "desc"));

  const snapshot = await getDocs(q);
  const list: Sale[] = snapshot.docs.map((doc) => ({
    docId: doc.id, 
    id: doc.data().id, 
    date: doc.data().date.toDate(),
    product: doc.data().product,
    price: doc.data().price,
    client: doc.data().client,
    category: doc.data().category,
    origin: doc.data().origin,
    materialCost:doc.data().materialCost,
    quantity:doc.data().quantity,
  })) as Sale[];

  return list

}

export async function deleteSale(docId: string): Promise<void> {
  const saleDocRef = doc(db, "sale", docId); 
  
  try {
    const docSnapshot = await getDoc(saleDocRef);

    if (docSnapshot.exists()) {
      const saleData = docSnapshot.data() as Sale;
      
      await addHistoric({ 
        action: `Excluiu a venda do cliente: ${saleData.client} (Produto: ${saleData.product}, Valor: R$ ${saleData.price})`,
        date: new Date(),
        user:"Izaque"
      });

      await deleteDoc(saleDocRef); 
      console.log("Venda excluída e histórico registrado:", docId);
    } else {
      console.log("Documento de venda não encontrado para exclusão:", docId);
      await deleteDoc(saleDocRef); 
    }

  } catch (error) {
    console.error("Erro ao excluir a venda ou registrar no histórico:", error);
    throw error;
  }
}