import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post('/:subsId', auth('user'));
// router.get("/", isValidUser, getMySubscriptionDetails);
// router.get("/my_packages", isValidUser, myPackages);

export const mySubscription = router;
