// Re-export all user services from a single entry point
export { UserCreationService } from './user-creation.service';
export { UserReadService } from './user-read.service';
export { UserUpdateService } from './user-update.service';
export { handleUserError } from './user.utils';

import { UserCreationService } from './user-creation.service';
import { UserReadService } from './user-read.service';
import { UserUpdateService } from './user-update.service';

// Backward compatibility - re-export as static class
export class UserService {
  static createUserProfile = UserCreationService.createUserProfile;
  static getUserProfile = UserReadService.getUserProfile;
  static userProfileExists = UserReadService.userProfileExists;
  static updateUserProfile = UserUpdateService.updateUserProfile;
  static updateLastLogin = UserUpdateService.updateLastLogin;
  static deactivateUser = UserUpdateService.deactivateUser;
}
