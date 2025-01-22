import { EventAttendee } from "./attendee.interface";
import { EventStatistic } from "./event.statistics.interface";
import { Ticket } from "./ticket.interface";
import { User } from "./user.interface";


export interface Event {
    event_id: string;
    title: string;
    description: string;
    date: Date;
    time: Date;
    location: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;
    images:string;
    capacity: number;
    available_slots:number;
    status: 'pending' | 'approved' | 'rejected';
    max_group_size: number; 
    is_deleted?:Boolean;
    tickets?: Ticket[];
    ticket_price:number;
    event_attendees?: EventAttendee[];
    notifications?: Notification[];
    event_statistics?: EventStatistic;
    booking_history?: BookingHistory[];
    createdBy?: User;
  }
  