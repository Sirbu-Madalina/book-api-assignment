import { Schema, model } from 'mongoose';
import { User } from '../interfaces/user';

const userSchema = new Schema<User>({
//Without this validation the user can send everything to API and MongoDB would accept it. It ensures data integrity.
  name: {type: String, required: true, min: 2, max: 255},
  email: {type: String, required: true, unique: true, min: 6, max: 255},
  password: {type: String, required: true, min: 6, max: 1024},
  role: {type: String, required: true, default: 'user'}
});

// Export the model
export const userModel = model<User>('User', userSchema);
