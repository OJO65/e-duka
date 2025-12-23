import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'eduka_user';

  private readonly DEMO_USER = {
    id: 1,
    username: 'ojo',
    password: 'ojo654465',
    email: 'odhiambo149@gmail.com',
  };

  private isLoggedInSubject = new BehaviorSubject<boolean>(
    this.checkLoginStatus()
  );
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.loadUser()
  );

  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor() {}

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

  login(
    email: string,
    password: string
  ): { success: boolean; message: string } {
    if (
      email === this.DEMO_USER.email &&
      password === this.DEMO_USER.password
    ) {
      const user: User = {
        id: this.DEMO_USER.id,
        username: this.DEMO_USER.username,
        email: this.DEMO_USER.email,
      };
      this.saveUser(user);
      this.isLoggedInSubject.next(true);
      this.currentUserSubject.next(user);
      return { success: true, message: 'Login successful' };
    } else {
      return { success: false, message: 'Invalid email or password' };
    }
  }

  logout(): void {
    this.removeUser();
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getDemoCredentials(): { email: string; password: string } {
    return {
      email: this.DEMO_USER.email,
      password: this.DEMO_USER.password,
    };
  }
}
