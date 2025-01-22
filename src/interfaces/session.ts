import { Request as ExpressRequest } from 'express';
import { Session } from 'express-session';

// Define a custom interface that extends Express's Request interface
export interface RequestWithSession extends ExpressRequest {
  session: Session & { email?: string }; // Extend session with your custom properties
  
}
