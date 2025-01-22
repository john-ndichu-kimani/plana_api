import { UserRole } from "../interfaces/role.interface";


declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      user_id: string;
      role: UserRole;
    };
  }
}
