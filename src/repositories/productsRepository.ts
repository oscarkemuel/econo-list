import { prismaClient } from "../database";
import { Product } from "../services/scrapingService";

class ProductRepository {
  private repository;

  constructor () {
    this.repository = prismaClient.productHistory;
  }

  async show() {
    return await this.repository.findMany();
  }

  async save(products: Product[], amazonListId: string) {
    for(let product of products) {
      await this.repository.create({
        data: {
          id: product.id,
          title: product.title,
          price: product.price || 0.0,
          listId: amazonListId
        }
      });
    }
  }

  async removeAll() {
    await this.repository.deleteMany();
  }
}

export default ProductRepository;