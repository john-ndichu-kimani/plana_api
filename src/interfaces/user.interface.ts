import { EventAttendee } from "./attendee.interface";
import { Event } from "./event.interface";
import { Ticket } from "./ticket.interface";
import { UserProfile } from "./user.profile.interface";

export interface User {
    user_id: string;
    username: string;
    email: string;
    password_hash: string;
    role: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    is_deleted:boolean;
    profile_picture_url?: string;
    created_at: Date;
    updated_at: Date;
    events?: Event[];
    tickets?: Ticket[];
    event_attendees?: EventAttendee[];
    notifications?: Notification[];
    reports?: Report[];
    user_profile?: UserProfile;
    booking_history?: BookingHistory[];
  }
  
  
export interface managerRequest{
  request_id: string;
  user_id: string;
  status: string;
  requested_at:Date;
  approved_at: Date;
  rejected_at: Date;
}



export interface login_details {
  email: string;
  password_hash: string;
}

export interface token_details {
  id: string;
  user_id:string;
  name: string;
  role:string;
  email: string;
}

export interface resetToken_details{
  reset_code: string;
  expires_at: Date;
  is_valid: boolean;
}

