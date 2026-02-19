// Import Document type from mongoose so our interface can extend it
import { Document } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
}
