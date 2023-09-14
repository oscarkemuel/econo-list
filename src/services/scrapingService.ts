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

  private async getTitleFromRow(row: ElementHandle): Promise<string | null> {
    const infosElement = await row.$("td:nth-child(2)");
    const titleElement = await infosElement?.$("span");

    if (titleElement && infosElement) {
      const fullTitle = (await infosElement.evaluate(
        (node: Element) => node.innerHTML
      )) as string;

      return this.formatTitle(fullTitle);
    }

    return null;
  }

  private async getPriceFromRow(row: ElementHandle): Promise<number | null> {
    const priceElement = await row.$("td:nth-child(4) > span");
    if (priceElement) {
      const value = (await priceElement.evaluate(
        (node: Element) => node.textContent
      )) as string;
      return Number(value.replace("R$", "").replace(",", "."));
    }
    return null;
  }

  async getProductsFromList(amazonListId: string): Promise<Product[]> {
    console.log(`LOG: Starting scraping for list ${amazonListId}`);
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-feature=site-per-process",
        "--ignore-certificate-errors",
      ],
      headless: "new",
      ignoreDefaultArgs: ["--disable-extensions"],
      timeout: 0,
    });
    console.log("LOG: Browser launched");
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    // blocking images and stylesheets
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        req.resourceType() === "image" ||
        req.resourceType() === "stylesheet" ||
        req.resourceType() == "font"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    let tableBody: ElementHandle | null = null;
    let retries = 0;
    const maxRetries = 5;

    while (!tableBody && retries < maxRetries) {
      try {
        await page.goto(
          `https://www.amazon.com.br/hz/wishlist/printview/${amazonListId}?target=_blank&ref_=lv_pv&filter=unpurchased&sort=default`,
          {
            waitUntil: "domcontentloaded",
            timeout: 0,
          }
        );

        tableBody = await page.waitForSelector(
          "#a-page > div > table > tbody",
          {
            timeout: 10000
          }
        );
      } catch (error) {
        console.log(`Failed to load the page, retrying... (${retries + 1})`);
        retries += 1;
      }
    }

    if (!tableBody) {
      console.log("Max retries reached. Exiting...");
      await browser.close();
      return [];
    }

    const tableRows = await tableBody!.$$("tr");

    const products: Product[] = [];

    if (tableRows) {
      for (let i = 0; i < tableRows.length; i += 1) {
        const row = tableRows[i];
        const [title, price] = await Promise.all([
          this.getTitleFromRow(row),
          this.getPriceFromRow(row),
        ]);

        if (title && price) {
          products.push({ title, price });
        }
      }
      console.log(`LOG: passed ${tableRows.length} rows`);
    }

    await page.close();
    await browser.close();

    console.log(`LOG: ${products.length} products found on scraping`);
    return products;
  }
}

export default ScrapingService;
