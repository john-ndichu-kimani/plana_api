import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { UserProfile } from "../interfaces/user.profile.interface";
import { extendedRequest } from "../middlewares/auth";

const userService = new UserService();

export class UserController {

  async registerUser(req: Request, res: Response) {
    try {
        const user = req.body;
        const result = await userService.createUser(user);
        if (result.error) {
          return res.status(400).json(result);
        }
        res.status(201).json(result);
    
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async fetchUsers(req:extendedRequest,res:Response){
  try{
    const result = await userService.fetchUsers();
    if (!result) {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}


  async getUserProfile(req: extendedRequest, res: Response) {
    try {
  
        const id  = req.info?.user_id as string;
        const result = await userService.getUserProfile(id);
        if (result.error) {
          return res.status(404).json(result);
        }
        res.status(200).json(result);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateProfile(req: extendedRequest, res: Response) {
    try {
        const  id = req.info?.user_id as string;
        const profile: Partial<UserProfile> = req.body;
        const result = await userService.updateProfile(id, profile);
        if (result.error) {
          return res.status(400).json(result);
        }
        res.status(200).json(result);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async assignRole(req: Request, res: Response) {
    try {
      
        const { user_id, role } = req.body;
        const result = await userService.assignRole(user_id, role);
        if (result.error) {
          return res.status(400).json(result);
        }
        res.status(200).json(result);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  
  
  async requestManager(req: extendedRequest, res: Response) {
    try {
      const id = req.info?.user_id as string;
      const result = await userService.requestManager(id);

      if (result.error) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  
  async handleManagerRequest(req: Request, res: Response) {
    try {
      const { request_id, action } = req.params;
      const result = await userService.handleManagerRequest(request_id, action as 'approve' | 'reject');

      if (result.error) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }


  async getAllManagerRequests(req: Request, res: Response) {
    try {
      const result = await userService.getAllManagerRequests();

      

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
