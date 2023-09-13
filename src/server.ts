import express from 'express';
import ScrapingService from './services/scrapingService';

const app = express();

app.get('/', async (req, res) => {
  const scrapingService = new ScrapingService();
  const products = await scrapingService.getProductsFromList('26AXMBD99MXXX');

  console.log(products.length);
  res.json(products);
});

app.listen(8000, () => {
  console.log('App listening on port 8000!');
});