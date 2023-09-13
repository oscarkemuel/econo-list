import puppeteer, { ElementHandle } from "puppeteer";

interface Product {
  title: string;
  price: string;
}

class ScrapingService {
  private async getTitleFromRow(row: ElementHandle): Promise<string | null> {
    const titleElement = await row.$("td:nth-child(2) > span");
    if (titleElement) {
      return (await titleElement.evaluate(
        (node: Element) => node.textContent
      )) as string;
    }
    return null;
  }

  private async getPriceFromRow(row: ElementHandle): Promise<string> {
    const priceElement = await row.$("td:nth-child(4) > span");
    if (priceElement) {
      return (await priceElement.evaluate(
        (node: Element) => node.textContent
      )) as string;
    }
    return "not available";
  }

  async getProductsFromList(amazonListId: string): Promise<Product[]> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // await page.goto(`https://www.amazon.com.br/hz/wishlist/printview/${amazonListId}?target=_blank&ref_=lv_pv&filter=unpurchased&sort=default`, {
    //   waitUntil: "networkidle0",
    //   timeout: 0,
    // });
    await page.goto("file:///home/oscar/Desktop/lista.html", {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    const tableBody = await page.waitForSelector(
      "#a-page > div > table > tbody"
    );
    const tableRows = await tableBody!.$$("tr");

    const products: Product[] = [];

    if (tableRows) {
      for (const row of tableRows) {
        const [title, price] = await Promise.all([
          this.getTitleFromRow(row),
          this.getPriceFromRow(row),
        ]);

        if (title) {
          products.push({ title, price });
        }
      }
    }

    await browser.close();

    return products;
  }
}

export default ScrapingService;
