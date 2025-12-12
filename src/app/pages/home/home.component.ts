import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategoryService } from '../../services/categoryService/category.service';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/productService/product.service';
import { Subscription } from 'rxjs';
import { SearchService } from '../../services/searchService/search.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, CategoryCardComponent],
})
export class HomeComponent implements OnInit, OnDestroy {
  categories: any[] = [];
  products: any[] = [];
  showProducts: boolean = false;
  loading: boolean = true;
  private searchSubscription?: Subscription;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private searchService: SearchService
  ) {}

   ngOnInit(): void {
   
    this.loadCategories();

    
    this.searchSubscription = this.searchService.search$.subscribe((query) => {
      if (!query || query.trim() === '') {
        
        this.showProducts = false;
        this.loading = false; 
        
        return;
      }

    
      this.loading = true;
      this.showProducts = true;
      this.productService.searchProducts(query).subscribe({
        next: (result: any) => {
          this.products = result.data.products.nodes;
          this.loading = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.loading = false;
          this.showProducts = false; 
        }
      });
    });
  }

  private loadCategories(): void {
    this.loading = true;
    this.categoryService.getCollections().subscribe({
      next: (result: any) => {
        this.categories = result.data.collections.nodes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Category loading error:', error);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}