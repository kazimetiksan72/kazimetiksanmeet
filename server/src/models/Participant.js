import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 60 },
  lastName: { type: String, required: true, trim: true, maxlength: 60 },
  phone: { type: String, required: true, trim: true, maxlength: 24 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
}, { timestamps: true, versionKey: false });

export const Participant = mongoose.model('Participant', participantSchema);
