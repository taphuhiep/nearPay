import { Context, logging, storage } from 'near-sdk-as'
import { Product, products } from './product_model';
import { Order, orders } from './order_model';

const INIT_ID = 0;

export function addNewProduct(title: string, description: string, image: string, price: u64, amount: u64):u64 {
        let prd_owner = Context.sender;
        let product_id = products.length + 1;
        let product = new Product(product_id, prd_owner, title, description, image, price, amount);
        let index = products.push(product);
        logging.log(product);
        return index;
}

export function createNewOrder(product: Product, buyer: string, seller: string, message: string, status: string): u64 {
      let order_id = orders.length + 1;
      let order = new Order(order_id, product, buyer, seller, message, status);
      let index = orders.push(order);
      logging.log(order);
      return index;
}

export function getProductById(product_id: u64) : Product {
      let results = new Array<Product>();
    
      for(let i = 0; i < products.length; i ++) {
          if(products[i].id == product_id) {
                results.push(products[i]);
          }
      }
      return results[0];
}