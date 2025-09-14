import { Schema, model, models } from 'mongoose'

const NotificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, required: true },
  targetUserId: { type: String, required: true },
  isRead: { type: Boolean, default: false },
})

export const Notification = models.Notification || model('Notification', NotificationSchema)
