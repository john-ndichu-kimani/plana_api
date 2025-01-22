import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login_details } from "../interfaces/user.interface";
import prisma from "../utils/init.prisma";

export class authService {
  prisma: PrismaClient;

  constructor() {
    this.prisma = prisma; // properly assign the imported prisma instance
  }

  async login(logins: login_details) {
    try {
      const user = await this.prisma.user.findMany({
        where: {
          email: logins.email
        }
      });

      if (user.length < 1) {
        return {
          error: "user not found"
        };
      }

      const hashedPassword = user[0].password_hash;

      // compare password
      const passwordMatches = bcrypt.compareSync(logins.password_hash, hashedPassword);

      if (passwordMatches) {
        const { user_id, username, email, role } = user[0];
        const payload = { user_id, username, email, role };
        const token = jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: '1h' });

        return {
          message: "Logged in successfully",
          token
        };
      } else {
        return {
          error: "Incorrect password"
        };
      }
    } catch (error) {
      console.error("Error during login:", error);
      return {
        error: "Internal server error"
      };
    }
  }
}
