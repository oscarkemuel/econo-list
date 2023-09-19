import ProductRepository from "../repositories/productsRepository";
import { Product } from "./scrapingService";

export interface PromoProduct extends Product {
  oldPrice: number;
  percentagePromo: number;
}

class ProductService {
  private productRepository = new ProductRepository();

  async getAllProducts() {
    return await this.productRepository.show();
  }

  async saveProducts(products: Product[], amazonListId: string) {
    return await this.productRepository.save(products, amazonListId);
  }

  async replaceAllProducts(products: Product[], amazonListId: string) {
    await this.productRepository.removeAll();

    await this.saveProducts(products, amazonListId);
  }

  async promoProducts(currentProducts: Product[], products: Product[]) {
    const promoProducts: PromoProduct[] = [];

    for (let currentProduct of currentProducts) {
      const product = products.find(product => product.id === currentProduct.id);

      if (product && product.price && currentProduct.price) {
        const currentPrice = currentProduct.price
        const oldPrice = product.price;
        const percentagePromo = 100 - (currentPrice * 100 / oldPrice);

        // If the current price is lower than the old price and the percentage of the promo is greater than 10%
        if ((currentPrice < oldPrice) && percentagePromo >= 10) {
          promoProducts.push({
            title: currentProduct.title,
            price: currentPrice,
            oldPrice,
            percentagePromo: percentagePromo.toFixed(2) as unknown as number,
            id: currentProduct.id
          });
        }
      }

      if (product && product.price === 0 && currentProduct.price && currentProduct.price > 0) {
        const currentPrice = currentProduct.price

        promoProducts.push({
          title: currentProduct.title,
          price: currentPrice,
          oldPrice: 0,
          percentagePromo: 100.00,
          id: currentProduct.id
        });
      }
    }

    const sortedPromoProducts = promoProducts.sort((a, b) => Number(b.percentagePromo) - Number(a.percentagePromo));

    return sortedPromoProducts;
  }
}

export default ProductService;