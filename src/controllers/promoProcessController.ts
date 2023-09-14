import { Request, Response } from 'express';
import PromoProcessService from '../services/promoProcessService';

class PromoProcessController {
  private promoProcessService = new PromoProcessService();

  async processPromoListToTelegram(req: Request, res: Response) {
    const { amazonListId } = req.params;

    this.promoProcessService.processPromoList(amazonListId);

    res.status(200).send({
      status: 'OK',
      time: `${new Date().toLocaleString('pt-BR')}`
    });
  }
}

export default PromoProcessController;