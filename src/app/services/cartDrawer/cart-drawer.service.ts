import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartDrawerService {
  private openSubject = new BehaviorSubject<boolean>(false);
  open$ = this.openSubject.asObservable();

  open():  void { this.openSubject.next(true); }
  close(): void { this.openSubject.next(false); }
  toggle(): void { this.openSubject.next(!this.openSubject.value); }
  isOpen(): boolean { return this.openSubject.value; }
}