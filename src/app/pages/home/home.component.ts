import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { CategoryService } from '../../services/categoryService/category.service';
import { ProductService } from '../../services/productService/product.service';
import { SearchService } from '../../services/searchService/search.service';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { CategorySkeletonComponent } from '../../components/category-skeleton/category-skeleton.component';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

interface Product {
  id: string;
  title: string;
  images: { nodes: Array<{ url: string }> };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode?: string };
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
    @Inject(PLATFORM_ID) private platformId: Object,
    private meta: Meta,
    private title: Title,
  ) {
    this.title.setTitle('GNET Computers - Laptops & Accessories Kenya');
    this.meta.updateTag({
      name: 'description',
      content:
        'Buy laptops, headsets, printers and computer accessories in Kenya. Apple, HP, Lenovo, Dell and more. Pay via M-Pesa',
    });
  }

  // ngOnInit intentionally empty — all init moved to ngAfterViewInit
  // so gridContainer is guaranteed to exist when observeCards() runs
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Order matters: observer first, then load, then subscribe to search
    this.initializeObserver();
    this.loadCategories();
    this.subscribeToSearch();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.observer?.disconnect();
  }

  private initializeObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const isMobile = window.innerWidth < 1024;
    const margin = isMobile ? '0px' : '-200px 0px -200px 0px';

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: margin },
    );
  }

  private observeCards(): void {
    if (!this.gridContainer?.nativeElement || !this.observer) return;
    this.observer.disconnect();
    const cards =
      this.gridContainer.nativeElement.querySelectorAll('.reveal-card');
    cards.forEach((card) => this.observer!.observe(card));
  }
  private subscribeToSearch(): void {
    this.searchSubscription = this.searchService.search$
      .pipe(skip(1)) // skip BehaviorSubject's initial '' emission
      .subscribe({
        next: (query) => this.handleSearch(query),
        error: (err) => console.error('Search error:', err),
      });
  }

  private handleSearch(query: string | null): void {
    const trimmed = query?.trim();
    if (!trimmed) {
      this.resetToCategories();
      return;
    }
    this.loading = true;
    this.showProducts = true;
    this.products = [];

    this.productService.searchProducts(trimmed).subscribe({
      next: (result: any) => {
        this.products = result.data.products.nodes;
        this.loading = false;
        setTimeout(() => this.observeCards(), 100);
      },
      error: (err) => {
        console.error('Search error:', err);
        this.loading = false;
        this.products = [];
      },
    });
  }

  private resetToCategories(): void {
    this.showProducts = false;
    this.products = [];
    this.loading = true;
    setTimeout(() => this.loadCategories(), 50);
  }

  private loadCategories(): void {
    this.categoryService.getCollections().subscribe({
      next: (result: any) => {
        this.categories = result.data.collections.nodes;
        this.loading = false;
        setTimeout(() => this.observeCards(), 100);
      },
      error: (err) => {
        console.error('Category error:', err);
        this.loading = false;
        this.categories = [];
      },
    });
  }

  trackByProductId(_i: number, p: Product): string {
    return p.id;
  }
  trackByCategoryId(_i: number, c: Category): string {
    return c.id;
  }
}
