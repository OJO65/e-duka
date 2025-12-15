import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() searchEvent = new EventEmitter<string>();

  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  isMobileMenuOpen = false;
  isAccountMenuOpen = false;

  constructor() {}

  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchQuery) => {
        this.searchEvent.emit(searchQuery);
      });
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleAccountMenu() {
    this.isAccountMenuOpen = !this.isAccountMenuOpen;
  }

  searchProducts() {
    this.searchEvent.emit(this.searchQuery.trim());
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery.trim());
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchEvent.emit('');
  }
}
