import { Component } from '@angular/core';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, CategoryCardComponent]
})
export class HomeComponent {
  categories = [
    { title: 'Electronics', image: '/assets/electronics.jpg' },
    { title: 'Clothing', image: '/assets/clothes.jpg' },
    { title: 'Shoes', image: '/assets/shoes.jpg' },
    { title: 'Accessories', image: '/assets/accessories.jpg' },
  ];
}
