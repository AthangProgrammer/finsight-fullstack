import mongoose from 'mongoose';

export const AUDIT_EVENTS = ['register', 'login.success', 'login.failure', 'login.locked', 'logout'];

const NINETY_DAYS_IN_SECONDS = 90 * 24 * 60 * 60;

const auditLogSchema = new mongoose.Schema(
  {
    event: { type: String, required: true, enum: AUDIT_EVENTS },
    userId: { type: String, default: null },
    ip: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 300 },
  },
  { collection: 'audit_logs', timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: NINETY_DAYS_IN_SECONDS });
auditLogSchema.index({ userId: 1 });

export const AuditLog = mongoose.models.AuditLog ?? mongoose.model('AuditLog', auditLogSchema);
