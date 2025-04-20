import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { otpRoutes } from "../modules/otp/otp.routes";
import { settingsRoutes } from "../modules/setting/setting.route";
import { notificationRoutes } from "../modules/notifications/notifications.route";
import { categoryRoutes } from "../modules/category/category.route";
import { subscriptionRoutes } from "../modules/subscription/subscription.route";

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: "/otp",
    route: otpRoutes
  },
  {
    path: "/settings",
    route: settingsRoutes
  },
  {
     path: "/notifications",
     route: notificationRoutes
  },
  {
    path: "/category",
    route: categoryRoutes
  },
  {
    path: "/subscription",
    route: subscriptionRoutes
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;