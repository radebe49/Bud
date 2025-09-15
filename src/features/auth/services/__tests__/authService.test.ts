/**
 * Tests for AuthService
 */

import { authService } from '../authService';
import { storageService } from '../../../../shared/services/storageService';

// Mock storage service
jest.mock('../../../../shared/services/storageService');

describe('AuthService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Clear any cached user state
    await authService.logout();
  });

  describe('signup', () => {
    it('should create a new user account', async () => {
      // Mock empty user database
      (storageService.getItem as jest.Mock).mockResolvedValue({});
      (storageService.setItem as jest.Mock).mockResolvedValue(undefined);

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const user = await authService.signup(credentials);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should reject invalid email', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(authService.signup(credentials)).rejects.toThrow('Please enter a valid email address');
    });

    it('should reject short password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: '123'
      };

      await expect(authService.signup(credentials)).rejects.toThrow('Password must be at least 6 characters long');
    });

    it('should reject duplicate email', async () => {
      // Mock existing user
      (storageService.getItem as jest.Mock).mockResolvedValue({
        'test@example.com': {
          id: '1',
          email: 'test@example.com',
          password: 'hashedpassword'
        }
      });

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(authService.signup(credentials)).rejects.toThrow('An account with this email already exists');
    });
  });

  describe('login', () => {
    it('should login existing user with correct credentials', async () => {
      // Mock existing user with hashed password
      const hashedPassword = btoa('password123' + 'salt'); // Simple mock hash
      (storageService.getItem as jest.Mock).mockResolvedValue({
        'test@example.com': {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          password: hashedPassword,
          createdAt: new Date(),
          lastLoginAt: new Date()
        }
      });
      (storageService.setItem as jest.Mock).mockResolvedValue(undefined);

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await authService.login(credentials);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
    });

    it('should reject invalid email', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(authService.login(credentials)).rejects.toThrow('Please enter a valid email address');
    });

    it('should reject non-existent user', async () => {
      (storageService.getItem as jest.Mock).mockResolvedValue({});

      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await expect(authService.login(credentials)).rejects.toThrow('No account found with this email address');
    });

    it('should reject incorrect password', async () => {
      const hashedPassword = btoa('correctpassword' + 'salt');
      (storageService.getItem as jest.Mock).mockResolvedValue({
        'test@example.com': {
          id: '1',
          email: 'test@example.com',
          password: hashedPassword
        }
      });

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(credentials)).rejects.toThrow('Incorrect password');
    });
  });

  describe('logout', () => {
    it('should clear current user', async () => {
      (storageService.removeItem as jest.Mock).mockResolvedValue(undefined);

      await authService.logout();

      expect(storageService.removeItem).toHaveBeenCalledWith('current_user');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from storage', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      (storageService.getItem as jest.Mock).mockResolvedValue(mockUser);

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null if no user in storage', async () => {
      (storageService.getItem as jest.Mock).mockResolvedValue(null);

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if user exists', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com'
      };

      (storageService.getItem as jest.Mock).mockResolvedValue(mockUser);

      const isAuth = await authService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false if no user exists', async () => {
      (storageService.getItem as jest.Mock).mockResolvedValue(null);

      const isAuth = await authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });
});