import express from 'express';
import authAdmin from '../middleware/authAdmin.js';
import { 
    adminLogin,
    adminGetDashData,
    adminGetAllAppointments,
    cancelAppointment,
    completeAppointment,
    deleteAppointment,
    acceptBalancePayment,
    creditUserAccount,
    deleteTreatment,
    adminLoginUser,
    adminRegisterUser,
    adminBookAppointment
} from '../controllers/adminController.js';

const adminRouter = express.Router();

// Admin authentication
adminRouter.post("/login", adminLogin);

// Admin user management
adminRouter.post("/login-user", authAdmin, adminLoginUser);
adminRouter.post("/register-user", authAdmin, adminRegisterUser);
adminRouter.post("/book-appointment", authAdmin, adminBookAppointment);

// Admin dashboard and appointments
adminRouter.get("/get-dash-data", authAdmin, adminGetDashData);
adminRouter.get("/get-all-appointments", authAdmin, adminGetAllAppointments);
adminRouter.post("/cancel-appointment", authAdmin, cancelAppointment);
adminRouter.post("/complete-appointment", authAdmin, completeAppointment);
adminRouter.post("/delete-appointment", authAdmin, deleteAppointment);
adminRouter.post("/accept-balance-payment", authAdmin, acceptBalancePayment);
adminRouter.post("/credit-user-account", authAdmin, creditUserAccount);
adminRouter.post("/delete-treatment", authAdmin, deleteTreatment);

export default adminRouter;
