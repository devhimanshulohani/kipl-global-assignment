import { User } from '../models/User';
import { AppAbility } from '../auth/abilities';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      ability?: AppAbility;
    }
  }
}
