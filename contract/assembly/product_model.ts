import { env, PersistentVector, PersistentMap } from "near-sdk-as";
@nearBindgen
export class Product {
  id: u64;
  owner: string;
  title: string;
  description: string;
  image: string;
  price: u64;
  amount: u64;

  constructor(id: u64, owner: string, title: string, description: string, image: string, price: u64, amount: u64) {
    this.id = id;
    this.owner = owner;
    this.title = title;
    this.description = description;
    this.image = image;
    this.price = price;
    this.amount = amount;
  }

}
// An array that stores meta data on the blockchain
export const products = new PersistentVector<Product>("prds");