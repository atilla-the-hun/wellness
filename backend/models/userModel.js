import mongoose from "mongoose"

const creditTransactionSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['credit', 'debit'] },
    appointmentId: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    image: { type: String },
    address: { type: Object },
    dob: { type: String },
    gender: { type: String },
    creditBalance: { type: Number, default: 0 },
    creditHistory: [creditTransactionSchema]
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
