import { Router } from 'express';
import { discoverMauritiusController } from './discoverMauritius.controller';
import auth from '../../middleware/auth';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
const upload = fileUpload('./public/uploads/recommented');


const router = Router();


router
 .post(
    "/admin/add",
    auth("admin"),
    // upload.single('video'),
    upload.fields([
      { name: 'thumbnailImage', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
    parseData(),
    discoverMauritiusController.createAdminDiscoverMauritiusVideo
)
  

 .patch(
    "/update/:discoverId",
    auth("admin"),
    // upload.single('video'),
    upload.fields([
      { name: 'thumbnailImage', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
    parseData(),
    discoverMauritiusController.updateAdminDiscoverMauritiusVideo
)
  
   .delete(
    "/delete/:discoverId",
    auth("admin"),
    discoverMauritiusController.deleteAdminDiscoverMauritiusVideo
)



.get("/", discoverMauritiusController.getAllDiscoverMauritius)

export const discoverMauritiusRoutes = router;