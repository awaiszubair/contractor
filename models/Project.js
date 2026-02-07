import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a project title'],
    },
    description: {
        type: String,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedContractors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // Contract specific fields
    scopeOfWork: {
        type: String,
    },
    serviceType: {
        type: String,
        enum: ['photographer', 'filmer', 'videographer'],
    },
    startDate: {
        type: Date,
    },
    dueDate: {
        type: Date,
    },
    amount: {
        type: Number,
    },
    paymentTerms: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending', 'Active', 'Completed'], // As per user request: Draft, Pending, Active, Completed
        default: 'Draft',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin who created it
    },
    editorName: {
        type: String, // As requested in UI "editor name"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
