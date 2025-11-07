export interface Idea {
  docId:string,
  id?: string;
  title: string;
  description: string;
  images: string[]; // pode ser File[] (antes do upload) ou string[] (depois)
}
