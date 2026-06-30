import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-return-policy',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './return-policy.component.html',
  styleUrls: ['./return-policy.component.css'],
})
export class ReturnPolicyComponent {
  lastUpdated = 'June 2026';
}