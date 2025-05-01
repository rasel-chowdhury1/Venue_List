import { Router } from 'express';
import auth from '../../middleware/auth';
import { SubcriptionPaymentController } from './subscriptionPayment.controller';

const router = Router();


router.post(
  '/confirm-payment',
  auth('user'),
  SubcriptionPaymentController.confirmPaymentSubcription
)


export const subcriptionPaymentRoutes = router;
