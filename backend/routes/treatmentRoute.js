import express from 'express';
import { loginTreatment, appointmentsTreatment, appointmentCancel, treatmentList, changeAvailablity, appointmentComplete, treatmentDashboard, treatmentProfile, updateTreatmentProfile } from '../controllers/treatmentController.js';
import authTreatment from '../middleware/authTreatment.js';
const treatmentRouter = express.Router();

treatmentRouter.post("/login", loginTreatment)
treatmentRouter.post("/cancel-appointment", authTreatment, appointmentCancel)
treatmentRouter.get("/appointments", authTreatment, appointmentsTreatment)
treatmentRouter.get("/list", treatmentList)
treatmentRouter.post("/change-availability", authTreatment, changeAvailablity)
treatmentRouter.post("/complete-appointment", authTreatment, appointmentComplete)
treatmentRouter.get("/dashboard", authTreatment, treatmentDashboard)
treatmentRouter.get("/profile", authTreatment, treatmentProfile)
treatmentRouter.post("/update-profile", authTreatment, updateTreatmentProfile)

export default treatmentRouter;