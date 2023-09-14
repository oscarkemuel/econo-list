import { Request, Response } from 'express';
import PromoProcessService from '../services/promoProcessService';

class PromoProcessController {
  private promoProcessService = new PromoProcessService();

  async processPromoList(req: Request, res: Response) {
    const { amazonListId } = req.params;

    const result = await this.promoProcessService.processPromoList(amazonListId);

    return res.json(result);
  }
}

export default PromoProcessController;