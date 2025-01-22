import { Router } from 'express';
import { TicketController } from '../controllers/tickets.controller';
import { authorizeAttendee, authorizeManager, verifyToken } from '../middlewares/auth';

const ticketRouter = Router();
const ticketController = new TicketController();

// Routes for ticket management
ticketRouter.post('/create', verifyToken, authorizeManager, ticketController.createTicket.bind(ticketController));
ticketRouter.get('/:ticket_id', ticketController.getTicket.bind(ticketController));
ticketRouter.put('/:ticket_id', verifyToken, authorizeManager, ticketController.updateTicket.bind(ticketController));
ticketRouter.delete('/:ticket_id', verifyToken, authorizeManager, ticketController.deleteTicket.bind(ticketController));
ticketRouter.get('/', ticketController.getAllTickets.bind(ticketController));
ticketRouter.get('/event/:event_id/tickets', verifyToken, ticketController.getTicketsByEventId.bind(ticketController));

// Routes for Event Attendee operations on tickets
ticketRouter.post('/book', verifyToken, authorizeAttendee, ticketController.bookEvent.bind(ticketController));
ticketRouter.post('/book-group', verifyToken, authorizeAttendee, ticketController.bookGroupTicket.bind(ticketController)); // New route for group booking
ticketRouter.patch('/cancel/:ticket_id', verifyToken, authorizeAttendee, ticketController.cancelBooking.bind(ticketController));
ticketRouter.get('/user/bookings', verifyToken, ticketController.getUserBookingHistory.bind(ticketController));

export default ticketRouter;
