// src/types/Purchase.ts
export interface Purchase {
  docId:string;
  id: number;
  date: Date;
  item: string;
  price: number;
  quantity: number;
  store: string;
  payment: string;
}
