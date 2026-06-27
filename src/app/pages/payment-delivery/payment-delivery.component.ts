import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-delivery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-delivery.component.html',
  styleUrls: ['./payment-delivery.component.css']
})
export class PaymentDeliveryComponent {
  pochilabiashara = '07177487775';
}