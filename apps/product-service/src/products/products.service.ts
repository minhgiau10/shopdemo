import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  findAll() {
    return [
      {
        id: 'product_001',
        name: 'iPhone 17',
        price: 25000000,
      },
      {
        id: 'product_002',
        name: 'Samsung Galaxy S26',
        price: 22000000,
      },
    ];
  }
}
