import { User } from "./user.interface";

export interface UserProfile {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_picture_url?: string;
    is_deleted?: boolean; 
    created_at: Date;
    updated_at: Date;
    user: User;
  }
  