import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Only Admin can receive from Client, Contractor receives from Admin (technically) or Admin checks them
    },
    fileUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    amount: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
