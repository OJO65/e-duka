import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'eduka_current_user';
  private readonly USERS_KEY = 'eduka_users';
  private readonly REMEMBER_ME_KEY = 'eduka_remember_me';

  private isLoggedInSubject = new BehaviorSubject<boolean>(
    this.checkLoginStatus()
  );
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.loadUser()
  );

  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor() {
    // Initialize with demo user if no users exist
    this.initializeDemoUser();
  }

  private checkLoginStatus(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  private loadUser(): User | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
    return null;
  }

  private saveUser(user: User): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }

  private removeUser(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private getUsers(): User[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private initializeDemoUser(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      // Create demo user for testing
      const demoUser: User = {
        id: 1,
        username: 'ojo',
        email: 'odhiambo149@gmail.com',
        password: 'ojo654465',
        orders: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
      };
      this.saveUsers([demoUser]);
    }
  }

  login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      // Create public user object without password
      const publicUser: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        orders: user.orders || [],
        wishlist: user.wishlist || [],
      };

      this.saveUser(publicUser);
      localStorage.setItem(this.REMEMBER_ME_KEY, rememberMe.toString());

      this.isLoggedInSubject.next(true);
      this.currentUserSubject.next(publicUser);

      return { success: true, message: 'Login successful', user: publicUser };
    }

    return { success: false, message: 'Invalid email or password' };
  }

  register(
    username: string,
    email: string,
    password: string
  ): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();

    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already registered' };
    }

    // Validate inputs
    if (!username || username.length < 3) {
      return {
        success: false,
        message: 'Username must be at least 3 characters',
      };
    }

    if (!this.isValidEmail(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters',
      };
    }

    // Create new user
    const newUser: User = {
      id: Date.now(),
      username,
      email,
      password,
      orders: [],
      wishlist: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    // Auto-login after registration
    return this.login(email, password, false);
  }

  logout(): void {
    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';

    this.removeUser();
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);

    if (!rememberMe) {
      localStorage.removeItem(this.REMEMBER_ME_KEY);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  updateUser(updates: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === currentUser.id);

    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.saveUsers(users);

      // Update current user in memory (exclude password)
      const updatedUser: User = {
        id: users[index].id,
        username: users[index].username,
        email: users[index].email,
        orders: users[index].orders || [],
        wishlist: users[index].wishlist || [],
      };

      this.currentUserSubject.next(updatedUser);
      this.saveUser(updatedUser);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getDemoCredentials(): { email: string; password: string } {
    return {
      email: 'odhiambo149@gmail.com',
      password: 'ojo654465',
    };
  }
}
