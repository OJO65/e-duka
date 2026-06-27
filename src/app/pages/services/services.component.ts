import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  whatsappNumber = '+254711115172'; 
  phoneNumber    = '+254 717 487 775/+254 711 115 172'; 

  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToShop(): void {
    this.router.navigate(['/shop']);
  }

  requestQuote(service: string): void {
    const message = encodeURIComponent(`Hi GNET Computers, I'd like a quote for ${service}.`);
    window.open(`https://wa.me/${this.whatsappNumber}?text=${message}`, '_blank');
  }

  callNow(): void {
    window.location.href = `tel:${this.phoneNumber.replace(/\s/g, '')}`;
  }
}