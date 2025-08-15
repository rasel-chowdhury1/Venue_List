import { Router } from "express";
import { settingsController } from "./setting.controller";
import auth from "../../middleware/auth";
import { getStaticPrivacyPolicy } from "../staticPages/privacyPolicy";
import { getStaticSupportPage } from "../staticPages/support";
import { getStaticAccountDeletePolicy } from "../staticPages/accountDeletePolicy";

export const settingsRoutes = Router();


settingsRoutes
     // Route to get the privacy policy
    .get("/privacy", settingsController.getPrivacyPolicy)
    .get("/privacy-policy", getStaticPrivacyPolicy)
    .get("/support", getStaticSupportPage)
    .get("/account-delete-policy", getStaticAccountDeletePolicy)
    .get("/termAndConditions", settingsController.getTermConditions)
    .get("/aboutUs", settingsController.getAboutUs)
    // Route to create or update the privacy policy
    .put("/", auth('admin'), settingsController.updateSettingsByKey);
