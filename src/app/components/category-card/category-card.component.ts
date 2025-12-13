import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.css']
})
export class CategoryCardComponent {
  @Input() category!: { title: string; image: { url: string } | null };
  @Input() title!: string;

  imageLoaded: boolean = false;
  imageError: boolean = false;

  get categoryImage(): string {
    return this.category?.image?.url || 'assets/placeholder.jpg';
  }

  onImageLoad() {
    this.imageLoaded = true;
  }

  onImageError() {
    this.imageError = true;
    this.imageLoaded = false;
  }
}
