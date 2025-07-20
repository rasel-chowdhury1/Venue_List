import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { subscriptionController } from './subscription.controller';

export const subscriptionRoutes = Router();

// create subscription route by admin
subscriptionRoutes.post(
  '/create',
  auth('admin'),
  subscriptionController.addSubscription,
)

//update subscription route by id
.patch(
  '/:subId/update',
  auth(USER_ROLE.ADMIN),
  subscriptionController.updateSubscription,
)

// delete subscription route by id
.delete(
  '/:subId/delete',
  auth(USER_ROLE.ADMIN),
  subscriptionController.deleteSubscription,
)

// get all subscription by admin
.get(
  '/',
  auth('user','admin'),
  subscriptionController.getAllSubscription,
);
