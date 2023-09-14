import 'dotenv/config'
import express from 'express';
import { prismaClient } from './database';
import PromoProcessController from './controllers/promoProcessController';

prismaClient.$connect()
.then(() => {
  console.log('📦 - Prisma connected!');

  const app = express();
  
  app.use(express.json());
  const promoProcessController = new PromoProcessController();

  app.get('/process-promo-list/:amazonListId', async (req, res) => {
    return promoProcessController.processPromoListToTelegram(req, res);
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚪 - Server is running at port ${process.env.PORT || 3000}`);
  });
}).catch((err: any) => {
  console.log('Prisma error', err);
});