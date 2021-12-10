import { env, PersistentVector, PersistentMap } from "near-sdk-as";
import {Product} from "./product_model";

@nearBindgen

export class Order {
    id: u64;
    created_at: string;
    product: Product;
    buyer: string;
    seller: string;
    message: string;
    status: string;

    constructor(id: u64, product: Product, buyer: string, seller: string, message: string, status: string) {
        this.created_at = env.block_timestamp().toString();
        this.product = product;
        this.buyer = buyer;
        this.seller = seller;
        this.message = message;
        this.status = status;
    }
}

// An array that stores orders on the blockchain
export const orders = new PersistentVector<Order>("ords");