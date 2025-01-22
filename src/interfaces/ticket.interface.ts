
import { Event } from "./event.interface";
import { User } from "./user.interface";
import { EventAttendee } from "./attendee.interface";

export enum BookingStatus {
  PENDING = 'pending',
  AVAILABLE = 'available',
  BOOKED = 'booked',
  CANCELLED = 'cancelled'
}

export enum TicketType {
  SINGLE = 'single',
  GROUP = 'group'
}


export interface Ticket {
  ticket_id: string;
  event_id: string;
  user_id: string;
  booking_status: string;
  price: number;
  ticket_type: TicketType;
  booking_date: Date;
  is_deleted?: boolean; 
  image?:string;
  event?: Event;
  user?: User;
  group_size?:number;
  event_attendees?: EventAttendee[];
  booking_history?: BookingHistory[];
}

export type TicketResult = Ticket | null;