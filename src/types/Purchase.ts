// src/types/Purchase.ts
export interface Purchase {
  id: number;
  date: string;
  item: string;
  price: number;
  quantity: number;
  store: string;
  payment: string;
}
