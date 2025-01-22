import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import cors from 'cors'
import user_router from "./routes/user.routes";
import auth_router from "./routes/auth.routes";
import password_router from "./routes/passwordReset.routes";
import eventRouter from "./routes/event.routes";
import session from 'express-session';
import ticket_router from "./routes/tickets.routes";
import chatRoutes from "./routes/chat.routes";

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
  });
  
  async function checkPrismaConnection() {
    try {
      await prisma.$connect();
      console.log('Prisma connected!');
    } catch (error) {
      console.error('Error connecting to Prisma:', error);
    }
  }
  
  checkPrismaConnection(); // Call the function to check the connection
  
  // Graceful shutdown on process termination
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
  });




const app = express();
const socketIo = require('socket.io');

app.use(express.json());
app.use(cors())
app.use(session({
  secret: 'your-secret-key', // Change this to a secure random string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Adjust cookie settings as needed
}));


//user routes
app.use('/user', user_router);

//auth
app.use('/auth', auth_router);

//password
app.use('/password',password_router);

//event routes
app.use('/events',eventRouter);


//ticket routes
app.use('/tickets',ticket_router);

app.use('/chats', chatRoutes);




app.use((error:Error,req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    message: error.message,
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
