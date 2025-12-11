import { Component, input, Input } from '@angular/core';


@Component({
  selector: 'app-category-card',
  standalone: true,
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.css']
})
export class CategoryCardComponent {
  @Input() category!: { title: string; image: { url: string } | null };
  @Input() title!: string;
}
