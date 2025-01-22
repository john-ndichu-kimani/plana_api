import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event.service';
import { Event } from '../interfaces/event.interface';
import { extendedRequest } from '../middlewares/auth';
import prisma from '../utils/init.prisma';


const eventService = new EventService();

export class EventController {
  // Create a new event
   createEvent = async (req: extendedRequest, res: Response) => {
    try {
      // Ensure that the user ID is extracted from the token
      const userId = req.info?.user_id;
  
      if (!userId) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Ensure that the user exists
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });
  
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Create the event
      const eventData = req.body;
      const event = await prisma.event.create({
        data: {
          ...eventData,
          created_by: user.user_id,
        },
      });
  
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get all events
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await eventService.getEvents();
      
      if ('error' in events) {
        return res.status(400).json(events);
      }
      res.status(200).json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching events' });
    }
  }

  // Get an event by ID
  async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const { event_id } = req.params;
      const event = await eventService.getEventById(event_id);
      if ('error' in event) {
        return res.status(404).json(event);
      }
      res.status(200).json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching the event' });
    }
  }

  // Update an event
  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { event_id } = req.params;
      const updatedEvent: Partial<Omit<Event, 'created_at' | 'updated_at' | 'tickets' | 'event_attendees' | 'notifications' | 'event_statistics' | 'booking_history' | 'event_approvals' | 'createdBy'>> = req.body;
      const event = await eventService.updateEvent(event_id, updatedEvent);
      if ('error' in event) {
        return res.status(400).json(event);
      }
      res.status(200).json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while updating the event' });
    }
  }

  // Delete an event
  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { event_id } = req.params;
      const result = await eventService.deleteEvent(event_id);
      if ('error' in result) {
        return res.status(400).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while deleting the event' });
    }
  }

  async approveEvent(req: Request, res: Response) {
    const { event_id } = req.params;

    const result = await eventService.approveEvent(event_id);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({ message: result.message, event: result.event });
  }

  async rejectEvent(req: Request, res: Response) {
    const { event_id } = req.params;

    const result = await eventService.rejectEvent(event_id);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({ message: result.message, event: result.event });
  }
}
