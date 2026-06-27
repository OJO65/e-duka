import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.css']
})
export class CareersComponent {
  careersEmail = 'Faognet@gmail.com';

  sendCV(): void {
    window.location.href = `mailto:${this.careersEmail}?subject=CV Submission - GNET Computers`;
  }
}