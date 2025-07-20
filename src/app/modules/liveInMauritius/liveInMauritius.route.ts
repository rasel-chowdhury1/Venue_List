import { Router } from 'express';
import auth from '../../middleware/auth';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import { liveInMauritiusController } from './liveInMauritius.controller';
const upload = fileUpload('./public/uploads/recommented');


const router = Router();


router
 .post(
    "/admin/add",
    auth("admin"),
    upload.single('video'),
    parseData(),
    liveInMauritiusController.createAdminLiveInMauritiusVideo
)


.get(
    "/", 
    liveInMauritiusController.getAllLiveInMauritius)

export const liveInMauritiusRoutes = router;