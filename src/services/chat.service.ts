import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ChatService {
  async createChatRoom(eventId: string, name?: string) {
    return prisma.chatRoom.create({
      data: {
        event: { connect: { event_id: eventId } },
        name,
      },
    });
  }

  async sendMessage(chatRoomId: string, senderId: string, content: string) {
    return prisma.message.create({
      data: {
        chatRoom: { connect: { chat_room_id: chatRoomId } },
        sender: { connect: { user_id: senderId } },
        content,
      },
    });
  }

  async getMessages(chatRoomId: string) {
    return prisma.message.findMany({
      where: { chat_room_id: chatRoomId },
      include: {
        sender: {
          select: { user_id: true, username: true, profile_picture_url: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async getEventChatRooms(eventId: string) {
    return prisma.chatRoom.findMany({
      where: { event_id: eventId },
      include: { participants: true },
    });
  }
}

export const chatService = new ChatService();
