import { Ticket } from "./ticket.interface";
import { User } from "./user.interface";

export interface EventAttendee {
    attendee_id: string;
    event_id: string;
    user_id: string;
    booking_status: string;
    booking_date: Date;
    ticket_id: string;
    is_deleted?: boolean; 
    event: Event;
    user: User;
    ticket: Ticket;
  }
  