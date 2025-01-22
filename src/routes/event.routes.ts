import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authorizeManager, authorizeSuperAdmin, verifyToken } from '../middlewares/auth';



const eventController = new EventController();
const eventRouter = Router();

// Route to create a new event
eventRouter.post(
  '/create',
  verifyToken,
  authorizeManager,
  eventController.createEvent.bind(eventController)
);

// Route to get all events
eventRouter.get(
  '/all',
  eventController.getEvents.bind(eventController)
);

// Route to get a specific event by ID
eventRouter.get(
  '/:event_id',
  eventController.getEventById.bind(eventController)
);

// Route to update an event
eventRouter.put(
  '/:event_id',
  verifyToken,
  authorizeManager,
  eventController.updateEvent.bind(eventController)
);

// Route to delete an event
eventRouter.delete(
  '/:event_id',
  verifyToken,
  authorizeManager,
  eventController.deleteEvent
);

// Route to approve an event
eventRouter.put('/:event_id/approve',verifyToken,authorizeSuperAdmin,eventController.approveEvent);

// Route to reject an event
eventRouter.put('/:event_id/reject',verifyToken,authorizeSuperAdmin, eventController.rejectEvent);

export default eventRouter;
