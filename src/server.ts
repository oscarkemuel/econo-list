import express from 'express';
import ScrapingService from './services/scrapingService';
import { prismaClient } from './database';
import PromoProcessController from './controllers/promoProcessController';

prismaClient.$connect()
.then(() => {
  console.log('📦 - Prisma connected!');

  const app = express();
  
  app.use(express.json());
  const promoProcessController = new PromoProcessController();

  app.get('/process-promo-list/:amazonListId', async (req, res) => {
    return promoProcessController.processPromoList(req, res);
  });

  app.listen(8000, () => {
    console.log(`🚪 - Server is running at port 8000`);
  });
}).catch((err: any) => {
  console.log('Prisma error', err);
});