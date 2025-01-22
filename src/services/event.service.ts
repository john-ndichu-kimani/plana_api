import prisma from '../utils/init.prisma';
import { Event } from '../interfaces/event.interface';
import { v4 as uuidv4 } from 'uuid';

export class EventService {
  // Create a new event
  async createEvent(eventData: Partial<Event>) {
    try {
      // Ensure that the user exists
      const user = await prisma.user.findUnique({
        where: { user_id: eventData.created_by },
      });

      if (!user) {
        return { error: "User not found" };
      }

      const combinedDateTime = new Date(`${eventData.date}T${eventData.time}`);

      // Create the event
      const newEvent = await prisma.event.create({
        data: {
          event_id: uuidv4(),
          title: eventData.title!,
          description: eventData.description!,
          date: new Date(combinedDateTime),
          time: new Date(combinedDateTime),
          location: eventData.location!,
          status: eventData.status || "pending",
          images: eventData.images,
          createdBy: {
            connect: { user_id: eventData.created_by! },
          },
          created_at: new Date(),
          capacity: eventData.capacity!,
        },
      });

      return {
        message: "Event created successfully",
        newEvent,
      };
    } catch (error) {
      console.error("Error creating event", error);
      return { error: "Error creating event" };
    }
  }

  // Get all events
  async getEvents() {
    try {
      const events = await prisma.event.findMany({
        where: { is_deleted: false }, // Ensure only non-deleted events are fetched
        include: {
          tickets: true,
          event_attendees: true,
          notifications: true,
          event_statistics: true,
          booking_history: true,
          event_approvals: true,
          createdBy: true,
        },
      });
      
      
      return {
        events
      };
    } catch (error) {
      console.error("Error fetching events", error);
      return { error: 'An error occurred while fetching events' };
    }
  }

  // Get an event by ID
  async getEventById(event_id: string) {
    try {
      const event = await prisma.event.findUnique({
        where: {
          event_id,
        },
        include: {
          tickets: true,
          event_attendees: true,
          notifications: true,
          event_statistics: true,
          booking_history: true,
          event_approvals: true,
          createdBy: true,
        },
      });

      if (!event || event.is_deleted) {
        return { error: 'Event not found' };
      }

      return event;
    } catch (error) {
      console.error("Error fetching event", error);
      return { error: 'An error occurred while fetching the event' };
    }
  }

  // Update an event
  async updateEvent(event_id: string, updatedEvent: Partial<Omit<Event, 'created_at' | 'updated_at' | 'tickets' |'is_deleted' | 'event_attendees' | 'notifications' | 'event_statistics'| 'is' | 'booking_history' | 'event_approvals' | 'createdBy'>>) {
    try {
      const event = await prisma.event.update({
        where: {
          event_id,
          is_deleted:false
        },
        data: {
          ...updatedEvent,
          updated_at: new Date(),
        },
      });

      return {
        message:"Event Updated Successfully",
        event
      };
    } catch (error) {
      console.error("Error updating event", error);
      return { error: 'An error occurred while updating the event' };
    }
  }

  // Delete an event (soft delete)
async deleteEvent(event_id: string) {
  try {
    // Check if the event exists
    const event = await prisma.event.findUnique({
      where: { event_id },
    });

    if (!event) {
      return { error: 'Event not found' };
    }

    // Perform the soft delete
    await prisma.event.update({
      where: { event_id },
      data: { is_deleted: true },
    });

    return { message: 'Event deleted successfully' };
  } catch (error) {
    console.error("Error deleting event", error);
    return { error: 'An error occurred while deleting the event' };
  }
}

 // Approve an event
 async approveEvent(event_id: string) {
  try {
    const event = await prisma.event.update({
      where: { event_id },
      data: { status: 'approved' },
    });

    return {
      message: 'Event approved successfully',
      event,
    };
  } catch (error) {
    console.error('Error approving event', error);
    return { error: 'An error occurred while approving the event' };
  }
}

// Reject an event
async rejectEvent(event_id: string) {
  try {
    const event = await prisma.event.update({
      where: { event_id },
      data: { status: 'rejected' },
    });

    return {
      message: 'Event rejected successfully',
      event,
    };
  } catch (error) {
    console.error('Error rejecting event', error);
    return { error: 'An error occurred while rejecting the event' };
  }
}

}
