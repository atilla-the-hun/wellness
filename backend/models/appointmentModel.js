import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    cancelledAtCheckout: { type: Boolean, default: false },
    creditProcessed: { type: Boolean, default: false }, // Added field to track if credit was processed
    paymentStatus: { 
        type: String, 
        enum: ['none', 'partial', 'full'], 
        default: 'none' 
    },
    paidAmount: { 
        type: Number, 
        default: 0 
    },
    isCompleted: { type: Boolean, default: false },
    bookingNumber: { type: String, required: true, unique: true },
    transactionDetails: [{ 
        type: Object,
        default: []
    }],
    practitioner: { type: String, required: true },
    pendingPayment: {
        type: {
            amount: Number,
            paymentType: String,
            timestamp: Date
        },
        default: null
    }
})

// Ensure bookingNumber is indexed for uniqueness and faster queries
appointmentSchema.index({ bookingNumber: 1 }, { unique: true });

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);

// Function to get the next booking number
const getNextBookingNumber = async () => {
    try {
        // Find the highest booking number
        const lastAppointment = await appointmentModel
            .findOne({})
            .sort({ bookingNumber: -1 })
            .select('bookingNumber');

        let nextNumber;
        if (lastAppointment && lastAppointment.bookingNumber) {
            // Extract the number and increment
            nextNumber = parseInt(lastAppointment.bookingNumber) + 1;
        } else {
            nextNumber = 1;
        }

        // Pad with zeros to maintain 6-digit format
        const bookingNumber = String(nextNumber).padStart(6, '0');

        // Double-check this number isn't already used
        const exists = await appointmentModel.findOne({ bookingNumber });
        if (exists) {
            // If somehow this number exists, try the next one
            return String(nextNumber + 1).padStart(6, '0');
        }

        return bookingNumber;
    } catch (error) {
        console.error('Error generating booking number:', error);
        throw new Error('Failed to generate booking number');
    }
};

// Add the function to the model
appointmentModel.getNextBookingNumber = getNextBookingNumber;

export default appointmentModel;
