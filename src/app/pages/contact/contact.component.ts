import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactEmail   = 'Faognet@gmail.com';
  whatsappNumber = '+254711115172';

  name    = '';
  email   = '';
  message = '';
  sent    = false;

  sendEmail(): void {
    const subject = encodeURIComponent('Inquiry from GNET Computers website');
    const body = encodeURIComponent(
      `Name: ${this.name}\nEmail: ${this.email}\n\n${this.message}`
    );
    window.location.href = `mailto:${this.contactEmail}?subject=${subject}&body=${body}`;
    this.sent = true;
  }

  openWhatsApp(): void {
    const message = encodeURIComponent("Hi GNET Computers, I'd like to ask about...");
    window.open(`https://wa.me/${this.whatsappNumber}?text=${message}`, '_blank');
  }
}