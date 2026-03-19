import { Request, Response, NextFunction } from 'express';
import { DocumentExpiryCronService } from '../services/document-expiry-cron.service';

export class CronController {
  /**
   * POST /api/cron/trigger-expiry-check
   * Manually trigger the document expiry email notification
   */
  static triggerExpiryCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await DocumentExpiryCronService.run();
      res.json({
        success: true,
        message: 'Document expiry check completed.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
