import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { otpRoutes } from "../modules/otp/otp.routes";
import { settingsRoutes } from "../modules/setting/setting.route";
import { notificationRoutes } from "../modules/notifications/notifications.route";
import { categoryRoutes } from "../modules/category/category.route";
import { subscriptionRoutes } from "../modules/subscription/subscription.route";
import { mySubscriptionRoutes } from "../modules/mySubscription/mySubscription.route.";
import { venueRoutes } from "../modules/venue/venue.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { discoverMauritiusRoutes } from "../modules/discoverMauritius/discoverMauritius.route";
import { recoveryRequestRoutes } from "../modules/recoveryRequest/recoveryRequest.route";
import { RecommendedRoutes } from "../modules/recommentedVideo/recommentedVideo.routes";
import { liveInMauritiusRoutes } from "../modules/liveInMauritius/liveInMauritius.route";
import { SubscriptionPage } from "twilio/lib/rest/events/v1/subscription";
import { subcriptionPaymentRoutes } from "../modules/subscriptionPayment/subscriptionPayment.route";

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
  },
  {
    path: "/mySubscription",
    route: mySubscriptionRoutes
  },
  
  {
    path: "/venue",
    route: venueRoutes
  },
  {
    path: "/review",
    route: ReviewRoutes
  },
  {
    path: "/recommented",
    route: RecommendedRoutes
  },
  {
    path: "/discover",
    route: discoverMauritiusRoutes
  },
  {
    path: "/recovery",
    route: recoveryRequestRoutes
  },
  {
    path: "/liveInMauritius",
    route: liveInMauritiusRoutes
  },
  {
    path: "/subscriptionPayment",
    route: subcriptionPaymentRoutes
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;