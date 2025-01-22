import { Request, Response } from 'express';
import { chatService } from '../services/chat.service';

class ChatController {
  async createChatRoom(req: Request, res: Response) {
    const { eventId, name } = req.body;
    try {
      const chatRoom = await chatService.createChatRoom(eventId, name);
      res.status(201).json(chatRoom);
    } catch (error) {
      res.status(500).json({ error});
    }
  }

  async sendMessage(req: Request, res: Response) {
    const { chatRoomId, senderId, content } = req.body;
    try {
      const message = await chatService.sendMessage(chatRoomId, senderId, content);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getMessages(req: Request, res: Response) {
    const { chatRoomId } = req.params;
    try {
      const messages = await chatService.getMessages(chatRoomId);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async getEventChatRooms(req: Request, res: Response) {
    const { eventId } = req.params;
    try {
      const chatRooms = await chatService.getEventChatRooms(eventId);
      res.status(200).json(chatRooms);
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}

export const chatController = new ChatController();
