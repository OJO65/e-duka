import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../services/categoryService/category.service';
import { ProductService } from '../../services/productService/product.service';
import { SearchService } from '../../services/searchService/search.service';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { CategorySkeletonComponent } from '../../components/category-skeleton/category-skeleton.component';

interface Product {
  id: string;
  title: string;
  images: {
    nodes: Array<{ url: string }>;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode?: string;
    };
  };
}

interface Category {
  id: string;
  title: string;
  image: { url: string } | null;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CategoryCardComponent,
    ProductCardComponent,
    SkeletonCardComponent,
    CategorySkeletonComponent,
  ],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  categories: Category[] = [];
  products: Product[] = [];
  showProducts = false;
  loading = true;

  readonly skeletonCount = 8;

  private searchSubscription?: Subscription;
  private observer?: IntersectionObserver;

  @ViewChild('gridContainer', { static: false })
  gridContainer?: ElementRef<HTMLDivElement>;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
    private readonly searchService: SearchService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.subscribeToSearch();
  }

  ngAfterViewInit(): void {
    this.initializeObserver();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.observer?.disconnect();
  }

  private initializeObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      },
    );

    this.observeCards();
  }

  private observeCards(): void {
    if (!this.gridContainer?.nativeElement || !this.observer) return;

    const cards =
      this.gridContainer.nativeElement.querySelectorAll('.reveal-card');
    cards.forEach((card) => this.observer!.observe(card));
  }

  private subscribeToSearch(): void {
    this.searchSubscription = this.searchService.search$.subscribe({
      next: (query) => this.handleSearch(query),
      error: (error) => console.error('Search subscription error:', error),
    });
  }

  private handleSearch(query: string | null): void {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
      this.resetToCategories();
      return;
    }

    this.loading = true;
    this.showProducts = true;

    this.productService.searchProducts(trimmedQuery).subscribe({
      next: (result: any) => {
        this.products = result.data.products.nodes;
        this.loading = false;
        // Re-observe cards after new products load
        setTimeout(() => this.observeCards(), 0);
      },
      error: (error) => {
        console.error('Product search error:', error);
        this.loading = false;
        this.products = [];
      },
    });
  }

  private resetToCategories(): void {
    this.showProducts = false;
    this.loading = false;
  }

  private loadCategories(): void {
    this.categoryService.getCollections().subscribe({
      next: (result: any) => {
        this.categories = result.data.collections.nodes;
        this.loading = false;
        // Re-observe cards after categories load
        setTimeout(() => this.observeCards(), 0);
      },
      error: (error) => {
        console.error('Category loading error:', error);
        this.loading = false;
        this.categories = [];
      },
    });
  }

  trackByProductId(_index: number, product: Product): string {
    return product.id;
  }

  trackByCategoryId(_index: number, category: Category): string {
    return category.id;
  }
}
