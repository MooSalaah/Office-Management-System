import { Schema, model, models } from 'mongoose'

const UserActivitySchema = new Schema({
  userId: { type: String, required: true },
  activity: { type: String, required: true },
  timestamp: { type: Date, required: true },
})

export const UserActivity = models.UserActivity || model('UserActivity', UserActivitySchema)
