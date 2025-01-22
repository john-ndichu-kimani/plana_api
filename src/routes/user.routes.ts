import {Router} from 'express'
import { UserController } from '../controllers/user.controller';


import { registerSchema } from '../validators/user.validators';
import validate from '../middlewares/validate';
import { authorizeAttendee, authorizeSuperAdmin, verifyToken } from '../middlewares/auth';

 const userController = new UserController();

const user_router = Router();

user_router.post('/register',validate(registerSchema),userController.registerUser);
user_router.get('/profile',verifyToken,userController.getUserProfile);
user_router.put('/profile',verifyToken,userController.updateProfile);
user_router.get('/all',userController.fetchUsers);

user_router.post('/role',verifyToken,authorizeSuperAdmin, userController.assignRole);
user_router.post('/request-manager',verifyToken,authorizeAttendee,userController.requestManager)
user_router.patch('/requests/:request_id/:action',verifyToken, userController.handleManagerRequest);
user_router.get('/manager-requests',verifyToken,authorizeSuperAdmin, userController.getAllManagerRequests);

export default user_router