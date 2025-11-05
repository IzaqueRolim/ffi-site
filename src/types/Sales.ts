export interface Sale { // Esta é uma suposição para que o código funcione
  docId: string; // ID do documento no Firestore
  id: number;
  date: string;
  product: string;
  price: number; 
  quantity:number;
  client: string;
  category: string;
  origin: string;
  materialCost:number;
}
