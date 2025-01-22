import { Request, Response } from 'express';
import createError from 'http-errors';
import { PasswordResetService } from '../services/passwordReset';

const passwordResetService = new PasswordResetService();

export class PasswordResetController {

  async requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const result = await passwordResetService.requestPasswordReset(email);

      if (result.error) {
        throw createError(404, result.error);
      }

      res.status(200).json({ message: result.message });
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      if (error instanceof createError.HttpError) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { email, resetCode, newPassword } = req.body;

    try {
      const result = await passwordResetService.resetPassword(email, resetCode, newPassword);

      if (result.error) {
        throw createError(400, result.error);
      }

      res.status(200).json({ message: result.message });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      if (error instanceof createError.HttpError) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
