// src/types/express.d.ts
import { User } from '../models/user.entity';

declare module 'express' {
  interface Request {
    user?: User;
  }
}