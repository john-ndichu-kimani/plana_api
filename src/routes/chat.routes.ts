import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';

const router = Router();

router.post('/create', chatController.createChatRoom);
router.post('/message', chatController.sendMessage);
router.get('/messages/:chatRoomId', chatController.getMessages);
router.get('/rooms/:eventId', chatController.getEventChatRooms);

export default router;
