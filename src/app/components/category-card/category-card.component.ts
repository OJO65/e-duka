import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.css']
})
export class CategoryCardComponent {
  @Input() category!: { id: string; title: string; image: { url: string } | null };
  @Input() title!: string;

  imageLoaded: boolean = false;
  imageError: boolean = false;

  constructor(private router: Router) {}

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

  toShop() {
    this.router.navigate(['/shop'], {
      queryParams: { collectionId: this.category.id }
    });
  }
}
