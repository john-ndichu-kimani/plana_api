interface BookingHistory {
  history_id: string;
  user_id: string;
  event_id: string;
  ticket_id: string;
  booking_date: Date;
  status: string;
  is_deleted: boolean;
  user: {
    user_id: string;
    username: string;
    email: string;
    profile_picture_url?: string; // Updated to optional
    // other properties...
  };
  event: {
    event_id: string;
    title: string;
    // other properties...
  };
  ticket: {
    ticket_id: string;
    price: number;
    // other properties...
  };
}
