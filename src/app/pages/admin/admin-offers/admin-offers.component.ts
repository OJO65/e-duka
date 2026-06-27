import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/authService/auth.service';

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-offers.component.html',
  styleUrls: ['./admin-offers.component.css'],
})
export class AdminOffersComponent implements OnInit {
  offers:     any[]   = [];
  loading              = true;
  showForm             = false;
  submitting           = false;
  error                = '';
  success              = '';
  newText              = '';
  newSortOrder         = 0;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void { this.loadOffers(); }

  loadOffers(): void {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/admin/offers`, {
      headers: { Authorization: `Bearer ${this.auth.getToken()}` }
    }).subscribe({
      next: (data) => { this.offers = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  createOffer(): void {
    if (!this.newText.trim()) { this.error = 'Offer text is required'; return; }
    this.submitting = true;
    this.error      = '';
    this.http.post<any>(`${environment.apiUrl}/admin/offers`,
      { text: this.newText, sort_order: this.newSortOrder },
      { headers: { Authorization: `Bearer ${this.auth.getToken()}` } }
    ).subscribe({
      next: () => {
        this.success    = 'Offer created!';
        this.submitting = false;
        this.showForm   = false;
        this.newText    = '';
        this.newSortOrder = 0;
        this.loadOffers();
      },
      error: (err) => {
        this.error      = err?.error?.error || 'Failed to create offer';
        this.submitting = false;
      }
    });
  }

  toggleActive(offer: any): void {
    this.http.patch<any>(`${environment.apiUrl}/admin/offers/${offer.id}`,
      { active: !offer.active },
      { headers: { Authorization: `Bearer ${this.auth.getToken()}` } }
    ).subscribe({
      next: () => { offer.active = !offer.active; },
      error: () => {}
    });
  }

  deleteOffer(id: string): void {
    this.http.delete(`${environment.apiUrl}/admin/offers/${id}`, {
      headers: { Authorization: `Bearer ${this.auth.getToken()}` }
    }).subscribe({
      next: () => { this.offers = this.offers.filter(o => o.id !== id); },
      error: () => {}
    });
  }
}