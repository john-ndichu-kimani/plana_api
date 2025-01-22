import { PrismaClient } from "@prisma/client";
import { User } from '../interfaces/user.interface';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from './email.service';
import jwt from 'jsonwebtoken';

import prisma from "../utils/init.prisma";

export class UserService {
  
  // Create a new user
  async createUser(user: Omit<User, 'user_id' | 'created_at' | 'updated_at' | 'events' | 'tickets' | 'event_attendees' | 'notifications' | 'event_approvals' | 'reports' | 'user_profile' | 'booking_history'>) {
    try {
      // Check if email already exists
      const existingUserWithEmail = await prisma.user.findFirst({
        where: {
          email: user.email,
        },
      });

      if (existingUserWithEmail) {
        return {
          error: "Email already exists",
        };
      }

      // Generate user ID and hash password
      const user_id = uuidv4();
      const hashedPassword = bcrypt.hashSync(user.password_hash, 6);

      const response = await prisma.user.create({
        data: {
          user_id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: 'attendee',
          phone_number: user.phone_number,
          profile_picture_url:"https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg?t=st=1721767806~exp=1721771406~hmac=2eabf978612ccdfd2ea6f27a59a484ddbee8498786207e1cb8f92a69a5ef94ee&w=740",
          password_hash: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Generate verification token
      const verificationToken = generateToken({ user_id }, '1d');

      // Construct verification link
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      // Send welcome email
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Our Platform!',
        template: 'welcome',
        context: {
          username: user.username,
          verificationLink: verificationLink,
        },
      });

      return {
        message: "User account created successfully",
        response,
      };

    } catch (e) {
      console.error(e);
      return {
        error: "An error occurred while creating the user",
      };
    }
  }

  //GET ALL USERS
  async fetchUsers(){
    try{
      const users = await prisma.user.findMany({
        where:{role:"attendee"}
      });
      if(!users){
       return{
        error:"Users could not be fetched",
       }
      }
      return users;
    }
  catch(error){
    return {
      error:"Error occurred while fetching users"
    }
  }
  }

  // Get the User Profile details
  async getUserProfile(_id: string) {
    try {
      const profile = await prisma.user.findUnique({
        where: {
          user_id: _id
        }
      });
      if (!profile) {
        return {
          error: `User not found`,
        };
      }

      return {
        profile
      };
    } catch (error) {
      return {
        error: "An error occurred while fetching the user profile",
      };
    }
  }

  // Update the profile details
  async updateProfile(_id: string, profile: Partial<User>) {
    try {
      const currentUser = await prisma.user.findUnique({
        where: {
          user_id: _id,
        },
      });

      if (!currentUser) {
        return {
          error: "User not found",
        };
      }
    
      const updatedProfile = await prisma.user.update({
        where: {
          user_id: _id,
          is_deleted:false
        },
        data: {
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone_number: profile.phone_number,
          profile_picture_url: profile.profile_picture_url,
          updated_at: new Date(),
        },
      });

      return {
        message: "User profile updated successfully",
        updatedProfile,
      };
    } catch (error) {
      console.error(error);
      return {
        error: "An error occurred while updating the user profile details",
      };
    }
  }

  async assignRole(user_id: string, role: 'event_attendee' | 'manager' | 'super_admin') {
    try {
      // Validate the role
      const validRoles = ['attendee', 'manager', 'super_admin'];
      if (!validRoles.includes(role)) {
        return {
          error: 'Invalid role. Valid roles are event_attendee, manager, and super_admin',
        };
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { user_id },
      });

      if (!user) {
        return {
          error: 'User not found',
        };
      }

      // Update the user's role
      const updatedUser = await prisma.user.update({
        where: { user_id },
        data: { role },
      });

      return {
        message: 'Role assigned successfully',
        updatedUser,
      };
    } catch (error) {
      console.error(error);
      return {
        error: 'Error while assigning user a role',
      };
    }
  }

  // Request to become a manager
  async requestManager(user_id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id },
      });

      if (!user) {
        return {
          error: 'User not found',
        };
      }

      // Create a new manager request
      const request_id = uuidv4();
      await prisma.managerRequest.create({
        data: {
          request_id,
          user_id,
          status: 'pending',
          requested_at: new Date(),
        },
      });

      // Get super admin email
      const superAdmin = await prisma.user.findFirst({
        where: { role: 'super_admin' },
      });

      // Send email to super admin
      if (superAdmin) {
        await sendEmail({
          to: superAdmin.email,
          subject: 'Manager Request',
          template: 'managerRequest',
          context: {
            username: user.username,
            request_id,
          },
        });
      }

      return {
        message: 'Manager request submitted successfully',
      };
    } catch (error) {
      console.error(error);
      return {
        error: 'Error while submitting manager request',
      };
    }
  }

  // Approve or reject a manager request
  async handleManagerRequest(request_id: string, action: 'approve' | 'reject') {
    try {
      const request = await prisma.managerRequest.findUnique({
        where: { request_id },
      });

      if (!request) {
        return {
          error: 'Request not found',
        };
      }

      if (action === 'approve') {
        await prisma.managerRequest.update({
          where: { request_id },
          data: {
            status: 'approved',
            approved_at: new Date(),
          },
        });

        await prisma.user.update({
          where: { user_id: request.user_id },
          data: { role: 'manager' },
        });

        // Notify the user
        const user = await prisma.user.findUnique({
          where: { user_id: request.user_id },
        });
        if (user) {
          await sendEmail({
            to: user.email,
            subject: 'Manager Request Approved',
            template: 'managerRequestApproved',
            context: {
              username: user.username,
            },
          });
        }

        return {
          message: 'Manager request approved',
        };
      } else {
        await prisma.managerRequest.update({
          where: { request_id },
          data: {
            status: 'rejected',
            rejected_at: new Date(),
          },
        });

        return {
          message: 'Manager request rejected',
        };
      }
    } catch (error) {
      console.error(error);
      return {
        error: 'Error while handling manager request',
      };
    }
  }

  // Get all manager requests
  async getAllManagerRequests() {
    try {
      const requests = await prisma.managerRequest.findMany({
        include: {
          user: true,
        },
      });

      return requests;
      
    } catch (error) {
      console.error(error);
      return {
        error: 'Error while fetching manager requests',
      };
    }
  }
}
function generateToken(payload: any, expiresIn: string): string {
  return jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn });
};

