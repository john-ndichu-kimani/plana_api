import { Request, Response } from 'express';
import { TicketService } from '../services/ticketService';
import { calculateTotalPrice } from '../utils/pricing';
import sendEmail from '../services/email.service';
import { extendedRequest } from '../middlewares/auth';

const ticketService = new TicketService();

export class TicketController {
  async createTicket(req: Request, res: Response) {
    try {
      const ticket = req.body;
      const result = await ticketService.createTicket(ticket);
      if ('error' in result) {
        return res.status(400).json(result);
      }
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTicket(req: Request, res: Response) {
    try {
      const { ticket_id } = req.params;
      const result = await ticketService.getTicket(ticket_id);
      if ('error' in result) {
        return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      console.error('Error retrieving ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateTicket(req: Request, res: Response) {
    try {
      const { ticket_id } = req.params;
      const updateData = req.body;
      const result = await ticketService.updateTicket(ticket_id, updateData);
      if ('error' in result) {
        return res.status(400).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteTicket(req: Request, res: Response) {
    try {
      const { ticket_id } = req.params;
      const result = await ticketService.deleteTicket(ticket_id);
      if ('error' in result) {
        return res.status(400).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTicketsByEventId(req: Request, res: Response) {
    try {
      const { event_id } = req.params;
      const result = await ticketService.getTicketsByEventId(event_id);
      if ('error' in result) {
        return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      console.error('Error retrieving tickets by event ID:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getAllTickets(req: Request, res: Response) {
    try {
      const result = await ticketService.getAllTickets();
      if ('error' in result) {
        return res.status(400).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      console.error('Error retrieving all tickets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async bookEvent(req: Request, res: Response) {
    try {
      const { ticket_id } = req.body;
      if (!ticket_id) {
        return res.status(400).json({ error: 'ticket_id is required' });
      }
      
      const ticket = await ticketService.getTicket(ticket_id);
      if ('error' in ticket) {
        return res.status(404).json(ticket);
      }

      const event = await ticketService.getEvent(ticket.event_id || '');
      if ('error' in event) {
        return res.status(404).json(event);
      }

      if (event.available_slots <= 0) {
        return res.status(400).json({ error: 'No available slots' });
      }

      const result = await ticketService.bookEventTicket(ticket_id);
      if ('error' in result) {
        return res.status(400).json(result);
      }

      // Update available slots after booking
      await ticketService.updateAvailableSlots(event.event_id, -1);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error booking event:', error);
      res.status(500).json({ error: 'Error booking event' });
    }
  }

  async bookGroupTicket(req: Request, res: Response) {
    try {
      const { event_id, emails, number_of_people, user_id } = req.body;
      
      if (!event_id || !emails || !number_of_people || !user_id) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const event = await ticketService.getEvent(event_id);
      if ('error' in event) {
        return res.status(404).json(event);
      }

      if (number_of_people > (event.max_group_size || 0)) {
        return res.status(400).json({ error: `Group size exceeds the maximum of ${event.max_group_size}` });
      }
      
      const totalPrice = calculateTotalPrice(number_of_people, event.ticket_price);
      
      const result = await ticketService.bookGroupTickets(event_id, number_of_people, user_id);
      if ('error' in result) {
        return res.status(400).json(result);
      }

      // Update available slots after booking
      await ticketService.updateAvailableSlots(event_id, -number_of_people);

      // Send email to each member of the group
      for (const email of emails) {
        await sendEmail(email);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error booking group tickets:', error);
      res.status(500).json({ error: 'Error booking group tickets' });
    }
  }

  async cancelBooking(req: Request, res: Response) {
    try {
      const { ticket_id } = req.params;
      const result = await ticketService.cancelEventBooking(ticket_id);
      if ('error' in result) {
        return res.status(400).json(result);
      }
      
      // Retrieve ticket and event details to update available slots
      const ticket = await ticketService.getTicket(ticket_id);
      if ('error' in ticket) {
        return res.status(404).json(ticket);
      }
      
      const event = await ticketService.getEvent(ticket.event_id || '');
      if ('error' in event) {
        return res.status(404).json(event);
      }
      
      // Update available slots after cancellation
      await ticketService.updateAvailableSlots(event.event_id, 1);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error canceling booking:', error);
      res.status(500).json({ error: 'Error canceling booking' });
    }
  }
  async getUserBookingHistory(req: extendedRequest, res: Response) {
    try {
      const user_id = req.info?.user_id; // Assumes user ID is stored in req.user by verifyToken middleware

      if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const result = await ticketService.getBookingHistoryByUser(user_id);
      if ('error' in result) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error retrieving user booking history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
