import { Router } from "express";
import auth from "../../middleware/auth";
import { RecoveryRequestController } from "./recoveryRequest.controller";
import fileUpload from "../../middleware/fileUpload";
import parseData from "../../middleware/parseData";
const upload = fileUpload('./public/uploads/recovery');

export const recoveryRequestRoutes = Router();

// create subscription route by admin
recoveryRequestRoutes.post(
  '/create',
  auth('user'),
  upload.fields([
      { name: 'supportingDocuments', maxCount: 10 },
    ]),

  parseData(),
  RecoveryRequestController.createRecoveryRequest
)

recoveryRequestRoutes.get(
  "/venue",
  RecoveryRequestController.getAllVenueRecoveryRequests
)

recoveryRequestRoutes.get(
  "/account",
  RecoveryRequestController.getAllAccountRecoveryRequests
)

recoveryRequestRoutes.patch(
  '/update/:id',
  auth("admin"),
  RecoveryRequestController.updateRecoveryRequestStatus
)

