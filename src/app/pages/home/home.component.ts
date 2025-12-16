import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CategoryService } from '../../services/categoryService/category.service';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/productService/product.service';
import { Subscription } from 'rxjs';
import { SearchService } from '../../services/searchService/search.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { CategorySkeletonComponent } from '../../components/category-skeleton/category-skeleton.component';

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
  categories: any[] = [];
  products: any[] = [];
  showProducts: boolean = false;
  loading: boolean = true;
  initialLoadComplete: boolean = false;
  private searchSubscription?: Subscription;
  private observer!: IntersectionObserver;

  @ViewChildren('revealCard') revealCards!: QueryList<ElementRef>;

  @ViewChildren('revealCategory') revealCategories!: QueryList<ElementRef>;

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
        if (this.initialLoadComplete) {
          this.loading = false;
        }
        return;
      }

      this.loading = true;
      this.showProducts = true;
      this.productService.searchProducts(query).subscribe({
        next: (result: any) => {
          this.products = result.data.products.nodes;
          this.loading = false;
          setTimeout(() => this.observeCards());
        },
        error: (error) => {
          console.error('Search error:', error);
          this.loading = false;
          this.showProducts = false;
        },
      });
    });
  }

  ngAfterViewInit(): void {
    this.setupObserver();

    this.revealCards?.changes.subscribe(() => this.observeCards());
    this.revealCategories?.changes.subscribe(() => this.observeCards());
  }

  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-6');
          } else {
            entry.target.classList.add('opacity-0', 'translate-y-6');
            entry.target.classList.remove('opacity-100', 'translate-y-0');
          }
        });
      },
      {
        threshold: 0.15, // 15% visible
        rootMargin: '0px 0px -50px 0px',
      }
    );
  }

  private observeCards(): void {
    if (this.revealCards) {
      this.revealCards.forEach((card) =>
        this.observer.observe(card.nativeElement)
      );
    }

    if (this.revealCategories) {
      this.revealCategories.forEach((category) =>
        this.observer.observe(category.nativeElement)
      );
    }
  }

  private loadCategories(): void {
    this.loading = true;
    this.initialLoadComplete = false;

    this.categoryService.getCollections().subscribe({
      next: (result: any) => {
        this.categories = result.data.collections.nodes;
        this.loading = false;
        this.initialLoadComplete = true;

        setTimeout(() => this.observeCards());
      },
      error: (error) => {
        console.error('Category loading error:', error);
        this.loading = false;
        this.initialLoadComplete = true;
      },
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}
