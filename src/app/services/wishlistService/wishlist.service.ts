import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly USERS_KEY = 'eduka_users';

  // Observable for wishlist changes
  private wishlistSubject = new BehaviorSubject<string[]>([]);
  public wishlist$: Observable<string[]> = this.wishlistSubject.asObservable();

  constructor() {}

  /**
   * Initialize wishlist for current user
   */
  initializeWishlist(userId: number): void {
    const wishlist = this.getWishlistByUserId(userId);
    this.wishlistSubject.next(wishlist);
  }

  /**
   * Get wishlist for a specific user
   */
  getWishlistByUserId(userId: number): string[] {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user || !user.wishlist) {
      return [];
    }

    return user.wishlist;
  }

  /**
   * Add product to wishlist
   */
  addToWishlist(userId: number, productId: string): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return false;
    }

    // Initialize wishlist if it doesn't exist
    if (!users[userIndex].wishlist) {
      users[userIndex].wishlist = [];
    }

    // Check if already in wishlist
    if (users[userIndex].wishlist!.includes(productId)) {
      return false; // Already in wishlist
    }

    // Add to wishlist
    users[userIndex].wishlist!.push(productId);

    // Save back to localStorage
    this.saveUsers(users);

    // Update observable
    this.wishlistSubject.next(users[userIndex].wishlist!);

    return true;
  }

  /**
   * Remove product from wishlist
   */
  removeFromWishlist(userId: number, productId: string): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1 || !users[userIndex].wishlist) {
      return false;
    }

    // Remove from wishlist
    users[userIndex].wishlist = users[userIndex].wishlist!.filter(
      (id: string) => id !== productId
    );

    // Save back to localStorage
    this.saveUsers(users);

    // Update observable
    this.wishlistSubject.next(users[userIndex].wishlist!);

    return true;
  }

  /**
   * Toggle product in wishlist (add if not present, remove if present)
   */
  toggleWishlist(userId: number, productId: string): boolean {
    if (this.isInWishlist(userId, productId)) {
      this.removeFromWishlist(userId, productId);
      return false; // Removed
    } else {
      this.addToWishlist(userId, productId);
      return true; // Added
    }
  }

  /**
   * Check if product is in wishlist
   */
  isInWishlist(userId: number, productId: string): boolean {
    const wishlist = this.getWishlistByUserId(userId);
    return wishlist.includes(productId);
  }

  /**
   * Get wishlist count
   */
  getWishlistCount(userId: number): number {
    return this.getWishlistByUserId(userId).length;
  }

  /**
   * Clear entire wishlist
   */
  clearWishlist(userId: number): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return false;
    }

    users[userIndex].wishlist = [];

    // Save back to localStorage
    this.saveUsers(users);

    // Update observable
    this.wishlistSubject.next([]);

    return true;
  }

  // Private helper methods

  private getUsers(): any[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  }

  private saveUsers(users: any[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }
}