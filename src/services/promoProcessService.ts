import ProductService from "./productService";
import ScrapingService from "./scrapingService";

class PromoProcessService {
  private productService = new ProductService();
  private scrapingService = new ScrapingService();

  async processPromoList(amazonListId: string) {
    const [currentProducts, products] = await Promise.all([
      this.scrapingService.getProductsFromList(amazonListId),
      this.productService.getAllProducts()
    ]);

    if (products.length === 0) {
      await this.productService.saveProducts(currentProducts, amazonListId);
      return { products: await this.productService.getAllProducts() };
    }

    const promoProducts = await this.productService.promoProducts(currentProducts, products);
    // TODO: Send message to telegram
    if(promoProducts.length > 0) console.log(promoProducts);

    await this.productService.replaceAllProducts(currentProducts, amazonListId);

    return { products };
  }
}

export default PromoProcessService;