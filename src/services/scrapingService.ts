import puppeteer, { ElementHandle } from "puppeteer";

export interface Product {
  title: string;
  price: number;
}
  
class ScrapingService {
  private formatTitle(innerHTML: string): string {
    const spanText = innerHTML.match(/<span class="a-text-bold">(.*?)<\/span>/);
    
    const brText = innerHTML.match(/<br>(.*?)\|/);
    
    if (spanText && brText) {
      return `${spanText[1]} - ${brText[1]}`.trim();
    }

    return `${innerHTML}`.trim();
  }

  private async getTitleFromRow(row: ElementHandle, count: number): Promise<string | null> {
    const infosElement = await row.$("td:nth-child(2)");
    const titleElement = await infosElement?.$("span");

    if (titleElement && infosElement) {
      const fullTitle = await infosElement.evaluate(
        (node: Element) => node.innerHTML
      ) as string

      return this.formatTitle(fullTitle)
    }
    
    return null;
  }

  private async getPriceFromRow(row: ElementHandle, count: number): Promise<number | null> {
    const priceElement = await row.$("td:nth-child(4) > span");
    if (priceElement) {
      const value = await priceElement.evaluate(
        (node: Element) => node.textContent
      ) as string
      return Number(value.replace("R$", "").replace(",", "."));
    }
    return null;
  }

  async getProductsFromList(amazonListId: string): Promise<Product[]> {
    const browser = await puppeteer.launch({
      'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      headless: true,
      ignoreDefaultArgs: ['--disable-extensions']
    });
    const page = await browser.newPage();
    // await page.goto(`https://www.amazon.com.br/hz/wishlist/printview/${amazonListId}?target=_blank&ref_=lv_pv&filter=unpurchased&sort=default`, {
    //   waitUntil: "networkidle0",
    //   timeout: 0,
    // });
    await page.goto("file:///home/oscar/Desktop/ontem.html", {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    const tableBody = await page.waitForSelector(
      "#a-page > div > table > tbody"
    );
    const tableRows = await tableBody!.$$("tr");

    const products: Product[] = [];

    if (tableRows) {
      for (let i = 0; i < tableRows.length; i += 1) {
        const row = tableRows[i];
        const [title, price] = await Promise.all([
          this.getTitleFromRow(row, i),
          this.getPriceFromRow(row, i),
        ]);

        if (title && price) {
          products.push({ title, price });
        }
      }
    }

    await browser.close();

    return products;
  }
}

export default ScrapingService;
