import ProductService, { PromoProduct } from "./productService";
import ScrapingService from "./scrapingService";
import TelegrafService from "./telegrafService";

class PromoProcessService {
  private productService = new ProductService();
  private scrapingService = new ScrapingService();
  private telegramService = new TelegrafService();

  private floatToReal(value: number) {
    return value.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL",
    });
  }

  private async formatMessageFromPromoList(products: PromoProduct[]) {
    let message = "🔥Livros mais baratos🔥\n\n";

    for (let product of products) {
      const escapedTitle = product.title.replace(
        /[_*\[\]()~>#+\-|={}.!]/g,
        "\\$&"
      );
      message += `📚 *${escapedTitle}*\n`;
      message += `💰 De ~${this.floatToReal(product.oldPrice).replace(
        /[_*\[\]()~>#+\-|={}.!]/g,
        "\\$&"
      )}~ por *${this.floatToReal(product.price).replace(
        /[_*\[\]()~>#+\-|={}.!]/g,
        "\\$&"
      )}*\n\n`;
    }

    return message;
  }

  async processPromoList(amazonListId: string) {
    const [currentProducts, products] = await Promise.all([
      this.scrapingService.getProductsFromList(amazonListId),
      this.productService.getAllProducts(),
    ]);

    if (products.length === 0) {
      await this.productService.saveProducts(currentProducts, amazonListId);
      console.log(`First time scraping. ${currentProducts.length} products found on scraping`)
      return { products: await this.productService.getAllProducts() };
    }

    const promoProducts = await this.productService.promoProducts(
      currentProducts,
      products
    );
    if (promoProducts.length > 0) {
      const message = await this.formatMessageFromPromoList(promoProducts);
      await this.telegramService.sendMessage(message);
      console.log("LOG: Message sent to telegram with promos")
    } else {
      console.log(`LOG: No promos found. ${products.length} products in database and ${currentProducts.length} products found on scraping`)
    }

    await this.productService.replaceAllProducts(currentProducts, amazonListId);
    console.log(`LOG: Products replaced on database. ${currentProducts.length} products found on scraping`)

    return { products };
  }
}

export default PromoProcessService;
