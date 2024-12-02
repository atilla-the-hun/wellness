import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import Treatment from '../models/treatmentModel.js';

// Admin login
export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check against environment variables
        if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { isAdmin: true },
            process.env.JWT_SECRET
        );

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin login user
export const adminLoginUser = async (req, res) => {
    try {
        const { phone } = req.body;
        
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please register first."
            });
        }

        res.status(200).json({
            success: true,
            userId: user._id
        });
    } catch (error) {
        console.error('Admin login user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin register user
export const adminRegisterUser = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Phone number already registered"
            });
        }

        const user = await User.create({
            name,
            phone,
            image: '/profile_pic.png', // Default profile image
            creditBalance: 0,
            creditHistory: []
        });

        res.status(201).json({
            success: true,
            userId: user._id
        });
    } catch (error) {
        console.error('Admin register user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin book appointment
export const adminBookAppointment = async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const {
            userId,
            docId,
            slotDate,
            slotTime,
            duration,
            amount,
            paymentType,
            paymentMethod,
            practitioner
        } = req.body;

        // Get user and treatment data
        const user = await User.findById(userId).session(session);
        const treatment = await Treatment.findById(docId).session(session);

        if (!user || !treatment) {
            throw new Error("User or treatment not found");
        }

        // Get next booking number
        const bookingNumber = await Appointment.getNextBookingNumber();

        // Calculate paid amount based on payment type
        const paidAmount = paymentType === 'full' ? amount : amount / 2;

        // Create transaction details
        const transaction = {
            amount: paidAmount,
            paymentMethod: paymentMethod,
            date: new Date(),
            paymentType: paymentType === 'full' ? 'full' : 'partial'
        };

        // Create appointment
        const appointment = await Appointment.create([{
            userId,
            docId,
            slotDate,
            slotTime,
            duration,
            amount,
            paidAmount,
            paymentType,
            paymentMethod,
            practitioner,
            bookingNumber,
            date: new Date(slotDate.split('_').join('-')).getTime(),
            userData: {
                name: user.name,
                phone: user.phone,
                image: user.image || '/profile_pic.png'
            },
            docData: {
                name: treatment.name,
                speciality: treatment.speciality,
                image: treatment.image
            },
            paymentStatus: paymentType === 'full' ? 'full' : 'partial',
            transactionDetails: [transaction]
        }], { session });

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            appointment: appointment[0]
        });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        console.error('Admin book appointment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

// Get dashboard data
export const adminGetDashData = async (req, res) => {
    try {
        // Get latest appointments
        const latestAppointments = await Appointment.find()
            .sort('-createdAt')
            .limit(10)
            .populate('userId', 'name phone image creditBalance')
            .populate('docId', 'name speciality image');

        // Get counts
        const treatments = await Treatment.countDocuments();
        const appointments = await Appointment.countDocuments();
        const patients = await User.countDocuments();

        res.status(200).json({
            success: true,
            latestAppointments,
            treatments,
            appointments,
            patients
        });
    } catch (error) {
        console.error('Get dashboard data error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all appointments
export const adminGetAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .sort('-createdAt')
            .populate('userId', 'name phone image creditBalance')
            .populate('docId', 'name speciality image');

        res.status(200).json({
            success: true,
            appointments
        });
    } catch (error) {
        console.error('Get all appointments error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { cancelled: true },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully"
        });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Complete appointment
export const completeAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { isCompleted: true },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Appointment marked as completed"
        });
    } catch (error) {
        console.error('Complete appointment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findByIdAndDelete(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Appointment deleted successfully"
        });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Accept balance payment
export const acceptBalancePayment = async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const { appointmentId, paymentMethod } = req.body;

        const appointment = await Appointment.findById(appointmentId).session(session);
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        if (appointment.paymentStatus === 'full') {
            throw new Error("Payment already completed");
        }

        // Get user data to check credit balance
        const user = await User.findById(appointment.userId).session(session);
        if (!user) {
            throw new Error("User not found");
        }

        // Calculate remaining amount
        const remainingAmount = appointment.amount - appointment.paidAmount;
        let creditUsed = 0;
        let remainingPayment = remainingAmount;

        // First, try to use available credit
        if (user.creditBalance > 0) {
            creditUsed = Math.min(user.creditBalance, remainingAmount);
            remainingPayment = remainingAmount - creditUsed;

            // Update user's credit balance if credit was used
            if (creditUsed > 0) {
                // Add credit transaction to user history
                await User.findByIdAndUpdate(user._id, {
                    $inc: { creditBalance: -creditUsed },
                    $push: {
                        creditHistory: {
                            amount: creditUsed,
                            type: 'debit',
                            appointmentId: appointment._id,
                            date: new Date(),
                            description: 'Used for balance payment'
                        }
                    }
                }, { session });

                // Add credit transaction to appointment
                await Appointment.findByIdAndUpdate(appointmentId, {
                    $inc: { paidAmount: creditUsed },
                    $push: {
                        transactionDetails: {
                            amount: creditUsed,
                            paymentMethod: 'credit_balance',
                            date: new Date(),
                            paymentType: 'credit',
                            description: 'Credit balance applied'
                        }
                    }
                }, { session });
            }
        }

        // If there's still remaining payment after using credits, process with provided payment method
        if (remainingPayment > 0) {
            // Create transaction for remaining balance payment
            const transaction = {
                amount: remainingPayment,
                paymentMethod: paymentMethod,
                date: new Date(),
                paymentType: 'balance',
                description: 'Balance payment'
            };

            // Update appointment with remaining payment
            await Appointment.findByIdAndUpdate(appointmentId, {
                $inc: { paidAmount: remainingPayment },
                paymentStatus: 'full',
                paymentMethod: paymentMethod,
                $push: { transactionDetails: transaction }
            }, { session });
        } else if (creditUsed > 0) {
            // If payment was fully covered by credits, update payment status
            await Appointment.findByIdAndUpdate(appointmentId, {
                paymentStatus: 'full'
            }, { session });
        }

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: creditUsed > 0 
                ? `Payment completed: ${creditUsed.toFixed(2)} credits used${remainingPayment > 0 ? ' and remaining paid by ' + paymentMethod : ''}`
                : "Balance payment accepted successfully"
        });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        console.error('Accept balance payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

// Credit user account
export const creditUserAccount = async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const { userId, amount, appointmentId } = req.body;

        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error("User not found");
        }

        const appointment = await Appointment.findById(appointmentId).session(session);
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        // Update user's credit balance
        const creditAmount = Number(amount);
        user.creditBalance = (user.creditBalance || 0) + creditAmount;

        // Add to credit history
        user.creditHistory.push({
            amount: creditAmount,
            type: 'credit',
            appointmentId: appointmentId.toString(),
            date: new Date(),
            description: 'Credit refund from cancelled appointment'
        });

        await user.save({ session });

        // Add credit transaction to appointment with proper format
        const transaction = {
            amount: creditAmount,
            paymentMethod: 'credit_refund',
            date: new Date(),
            paymentType: 'credit_refund',
            description: 'Amount credited to user account'
        };

        // Update appointment
        appointment.transactionDetails.push(transaction);
        appointment.creditProcessed = true;
        await appointment.save({ session });

        // Get updated appointment with populated data
        const updatedAppointment = await Appointment.findById(appointmentId)
            .populate('userId', 'name phone image creditBalance creditHistory')
            .populate('docId', 'name speciality image')
            .session(session);

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "Credits added successfully",
            appointment: updatedAppointment,
            creditBalance: user.creditBalance
        });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        console.error('Credit user account error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

// Delete treatment
export const deleteTreatment = async (req, res) => {
    try {
        const { treatmentId } = req.body;

        const treatment = await Treatment.findByIdAndDelete(treatmentId);
        if (!treatment) {
            return res.status(404).json({
                success: false,
                message: "Treatment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Treatment deleted successfully"
        });
    } catch (error) {
        console.error('Delete treatment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
