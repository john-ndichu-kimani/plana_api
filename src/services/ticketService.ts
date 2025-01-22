import { PrismaClient, Ticket, Event, BookingHistory } from '@prisma/client';

const prisma = new PrismaClient();

type TicketWithEventAndBookingHistory = Ticket & {
  event: Event;
  booking_history: BookingHistory[];
};

export class TicketService {
  async createTicket(ticketData: Ticket): Promise<Ticket | { error: string }> {
    try {
      const ticket = await prisma.ticket.create({
        data: {
          event: {
            connect: { event_id: ticketData.event_id }
          },
          user: {
            connect: { user_id: ticketData.user_id }
          },
          price: ticketData.price,
          booking_date: ticketData.booking_date,
          image: ticketData.image,
          booking_status: ticketData.booking_status,
          ticket_type: ticketData.ticket_type,
        },
      });
      return ticket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      return { error: 'Error creating ticket' };
    }
  }
  
  async getTicket(ticket_id: string): Promise<Ticket | { error: string }> {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { ticket_id },
      });
      if (!ticket) {
        return { error: 'Ticket not found' };
      }
      return ticket;
    } catch (error) {
      console.error('Error retrieving ticket:', error);
      return { error: 'Error retrieving ticket' };
    }
  }

  async updateTicket(ticket_id: string, updateData: Partial<Ticket>): Promise<Ticket | { error: string }> {
    try {
      const ticket = await prisma.ticket.update({
        where: { ticket_id },
        data: updateData,
      });
      return ticket;
    } catch (error) {
      console.error('Error updating ticket:', error);
      return { error: 'Error updating ticket' };
    }
  }

  async deleteTicket(ticket_id: string): Promise<{ message: string } | { error: string }> {
    try {
      await prisma.ticket.delete({
        where: { ticket_id },
      });
      return { message: 'Ticket deleted successfully' };
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return { error: 'Error deleting ticket' };
    }
  }

  async getAllTickets(): Promise<Ticket[] | { error: string }> {
    try {
      const tickets = await prisma.ticket.findMany();
      return tickets;
    } catch (error) {
      console.error('Error retrieving tickets:', error);
      return { error: 'Error retrieving tickets' };
    }
  }

  async bookEventTicket(ticket_id: string): Promise<{ message: string } | { error: string }> {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { ticket_id },
      });

      if (!ticket) {
        return { error: 'Ticket not found' };
      }

      // if (ticket.booking_status === 'booked') {
      //   return { error: 'Ticket is already booked' };
      // }

      await prisma.ticket.update({
        where: { ticket_id },
        data: { booking_status: 'booked' },
      });

      // Store booking information in BookingHistory
      if (ticket.user_id) {  // Ensure user_id is available before creating booking history
        await prisma.bookingHistory.create({
          data: {
            user_id: ticket.user_id,
            ticket_id,
            event_id: ticket.event_id || '',  // Ensure event_id is available
            booking_date: new Date(),
          },
        });
      }

      return { message: 'Ticket booked successfully' };
    } catch (error) {
      console.error('Error booking event ticket:', error);
      return { error: 'Error booking event ticket' };
    }
  }

  async bookGroupTickets(event_id: string, number_of_people: number, user_id: string): Promise<{ message: string } | { error: string }> {
    try {
      const event = await prisma.event.findUnique({
        where: { event_id },
      });

      if (!event) {
        return { error: 'Event not found' };
      }

      if (event.available_slots < number_of_people) {
        return { error: 'Not enough available slots' };
      }

      const ticketPrice = event.ticket_price;

      // Create tickets for each person in the group
      const tickets = await Promise.all(
        Array.from({ length: number_of_people }, () =>
          prisma.ticket.create({
            data: {
              event_id,
              booking_status: 'booked',
              user_id,
              price: ticketPrice,
            },
          })
        )
      );

      // Create booking history entries for each ticket
      await Promise.all(
        tickets.map(async (ticket) => {
          await prisma.bookingHistory.create({
            data: {
              user_id,
              ticket_id: ticket.ticket_id,
              event_id,
              booking_date: new Date(),
            },
          });
        })
      );

      // Update available slots
      await this.updateAvailableSlots(event_id, -number_of_people);

      return { message: 'Group tickets booked successfully' };
    } catch (error) {
      console.error('Error booking group tickets:', error);
      return { error: 'Error booking group tickets' };
    }
  }

  async cancelEventBooking(ticket_id: string): Promise<{ message: string } | { error: string }> {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { ticket_id },
      });

      if (!ticket || ticket.booking_status !== 'booked') {
        return { error: 'Ticket is not booked' };
      }

      await prisma.ticket.update({
        where: { ticket_id },
        data: { booking_status: 'available' },
      });

      // Remove booking information from BookingHistory
      await prisma.bookingHistory.deleteMany({
        where: { ticket_id },
      });

      return { message: 'Booking canceled successfully' };
    } catch (error) {
      console.error('Error canceling event booking:', error);
      return { error: 'Error canceling event booking' };
    }
  }

  async getTicketsByEventId(event_id: string): Promise<Ticket[] | { error: string }> {
    try {
      const tickets = await prisma.ticket.findMany({
        where: { event_id },
      });
      return tickets;
    } catch (error) {
      console.error('Error retrieving tickets by event ID:', error);
      return { error: 'Error retrieving tickets by event ID' };
    }
  }

  async getEvent(event_id: string): Promise<Event | { error: string }> {
    try {
      const event = await prisma.event.findUnique({
        where: { event_id },
      });
      if (!event) {
        return { error: 'Event not found' };
      }
      return event;
    } catch (error) {
      console.error('Error retrieving event:', error);
      return { error: 'Error retrieving event' };
    }
  }

  async updateAvailableSlots(event_id: string, change: number): Promise<void | { error: string }> {
    try {
      await prisma.event.update({
        where: { event_id },
        data: {
          available_slots: {
            increment: change,
          },
        },
      });
    } catch (error) {
      console.error('Error updating available slots:', error);
      return { error: 'Error updating available slots' };
    }
  }

  async getBookingHistoryByUser(user_id: string): Promise<BookingHistory[] | { error: string }> {
    try {
      const bookings = await prisma.bookingHistory.findMany({
        where: { user_id },
        include: {
          ticket: true, // Include related ticket details
          event: true   // Include related event details
        }
      });

      if (bookings.length === 0) {
        return { error: 'No bookings found for this user' };
      }

      return bookings;
    } catch (error) {
      console.error('Error retrieving booking history:', error);
      return { error: 'Internal server error' };
    }
  }
}