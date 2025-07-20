import { Router } from 'express';
import auth from '../../middleware/auth';
import { mySubscriptionController } from './mySubscription.controller';

const router = Router();

router.post(
    "/buy",
    auth("user"),
    mySubscriptionController.purchasedSubscription
)

router.get(
    "/",
    auth("user"),
    mySubscriptionController.getMySubscriptionDetails
)
// router.get("/", isValidUser, getMySubscriptionDetails);
// router.get("/my_packages", isValidUser, myPackages);

export const mySubscriptionRoutes = router;
