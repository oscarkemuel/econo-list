import puppeteer, { ElementHandle } from "puppeteer";

export interface Product {
  id: string;
  title: string;
  price?: number;
}

class ScrapingService {
  private async getInfos(row: ElementHandle) {
    const title = await row.$('a[id*="itemName"]');
    const complement = await row.$('span[id*="item-byline"]');

    if (title && complement) {
      const titleText = await title.evaluate((node) => node.title);
      const complementText = await complement.evaluate((node) => node.innerHTML);
      const href = await title.evaluate((node) => node.href);
      const match = href.match(/\/dp\/([^\/\?]+)/);
      const id = match ? match[1] : null;

      return {
        id,
        title: `${titleText} - ${complementText.replace('\n', '').trim()}`,
      };
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
          `https://www.amazon.com.br/hz/wishlist/ls/${amazonListId}?ref_=wl_share&viewType=list`,
          {
            waitUntil: "domcontentloaded",
            timeout: 0,
          }
        );

        tableBody = await page.waitForSelector(
          "#g-items",
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

    const products: Product[] = [];
    let isEndList = false;

    while (!isEndList) {
      let previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const endText = await page.evaluate(
        () => document.querySelector("#endOfListMarker")?.textContent
      );
      if (endText) isEndList = true;
    }

    const tableRows = await tableBody!.$$("li");

    if (tableRows) {
      for (let i = 0; i < tableRows.length; i += 1) {
        const row = tableRows[i];
        const price = await row.evaluate(
          (node) => node.getAttribute("data-price")
        );

        if (price) {
          const infos = await this.getInfos(row);

          const newPrice = Number(price) == -Infinity || Number(price) == Infinity ? 0 : Number(price);

          if (infos?.title && price && infos?.id) {
            products.push({ title: infos.title, price: newPrice, id: infos.id });
          }
        }

        if(!price) {
          const infos = await this.getInfos(row);

          if (infos?.title && infos?.id) {
            products.push({ title: infos.title, id: infos.id });
          }
        }
      }
    }

    await page.close();
    await browser.close();

    console.log(`LOG: ${products.length} products found on scraping`);
    return products;
  }
}

export default ScrapingService;
