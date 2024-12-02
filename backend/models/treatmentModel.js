import mongoose from "mongoose";

const treatmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    speciality: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    slots_booked: { type: Object, default: {} }, // Deprecated - keeping for backward compatibility
    practitioner_bookings: {
        type: Object,
        default: {} // Will store as { practitioner: { date: [times] } }
    },
    date: { type: Number, required: true },
    time_slots: [{
        duration: { type: Number, required: true }, // Duration in minutes
        price: { type: Number, required: true } // Price for this duration
    }]
}, { minimize: false })

const treatmentModel = mongoose.models.treatment || mongoose.model("treatment", treatmentSchema);
export default treatmentModel;
