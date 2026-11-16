import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { updateUserSchema, updateMeSchema } from './users.schema.js';
import { listUsersCtrl, getUserCtrl, updateUserCtrl, deleteUserCtrl, updateMeCtrl } from './users.controller.js';
import { auth } from '../../middleware/auth.js';

const router = Router();

router.patch('/me', auth, validate(updateMeSchema), updateMeCtrl);
router.get('/', listUsersCtrl);
router.get('/:id', getUserCtrl);
router.patch('/:id', validate(updateUserSchema), updateUserCtrl);
router.delete('/:id', deleteUserCtrl);


export default router;

