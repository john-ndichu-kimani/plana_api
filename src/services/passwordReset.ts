import { hashPassword } from "../utils/bcrypt";
import prisma from "../utils/init.prisma";
import sendEmail from "./email.service";
import createError from 'http-errors';

export class PasswordResetService {

  async requestPasswordReset(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw createError(404, 'User not found');
      }

      const resetCode = Math.random().toString(36).substr(2, 6); // Generate a reset code
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 1); // Expires in 1 hour

      await prisma.passwordResetToken.create({
        data: {
          user_id: user.user_id,
          reset_code: resetCode,
          expires_at: expirationTime,
        },
      });

      const templateData = {
        firstName: user.first_name,
        lastName: user.last_name,
        resetCode: resetCode, // Include the reset code in the email
      };

      const emailOptions = {
        to: email,
        subject: 'Password Reset',
        template: 'resetPassword',
        context: templateData,
      };

      await sendEmail(emailOptions);

      return {
        message: "Password reset link sent",
        resetCode: resetCode,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof createError.HttpError) {
        throw error;
      }
      return { error: "An error occurred while requesting a password reset" };
    }
  }

  async resetPassword(email: string, resetCode: string, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw createError(404, 'User not found');
      }

      const token = await prisma.passwordResetToken.findFirst({
        where: {
          user_id: user.user_id,
          reset_code: resetCode,
          is_valid: true,
          expires_at: { gt: new Date() },
        },
      });

      if (!token) {
        throw createError(400, 'Invalid or expired reset code');
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { user_id: user.user_id },
        data: { password_hash: hashedPassword },
      });

      await prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { is_valid: false },
      });

      return { message: "Password reset successfully" };
    } catch (error) {
      console.error(error);
      if (error instanceof createError.HttpError) {
        throw error;
      }
      return { error: "An error occurred while resetting the password" };
    }
  }
}
