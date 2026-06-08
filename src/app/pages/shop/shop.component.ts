import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/productService/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SearchService } from '../../services/searchService/search.service';
import { ShopSkeletonComponent } from '../../components/shop-skeleton/shop-skeleton.component';
import { FilterSidebarComponent, FilterOptions, ActiveFilters } from '../../components/filter-sidebar/filter-sidebar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

interface Product {
  id: string;
  title: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  images: { nodes: Array<{ url: string }> };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    FilterSidebarComponent,
    ShopSkeletonComponent,
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
})
export class ShopComponent implements OnInit, OnDestroy {
  categoryId:          string  = '';
  categoryTitle:       string  = '';
  categoryDescription: string  = '';
  allProducts:         Product[] = [];
  filteredProducts:    Product[] = [];
  loading:             boolean = true;
  searching:           boolean = false;
  mobileFiltersOpen:   boolean = false;

  filterOptions: FilterOptions = {
    brands: [], tags: [], colors: [], sizes: [], priceRanges: [], minPrice: 0, maxPrice: 0,
  };

  activeFilters: ActiveFilters = {
    selectedBrands: [], selectedTags: [], selectedPriceRanges: [],
    selectedColors: [], selectedSizes: [], showAvailableOnly: false,
  };

  sortBy: string = 'default';

  private routeSubscription?:  Subscription;
  private searchSubscription?: Subscription;

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private productService: ProductService,
    private searchService:  SearchService,
    private meta:           Meta,
    private titleService:   Title,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      const collectionId = params['collectionId'];
      if (!collectionId) { console.error('No collectionId provided in query params'); return; }
      this.categoryId = collectionId;
      this.loadProducts();
    });

    this.searchSubscription = this.searchService.search$.subscribe((query) => {
      if (!this.loading && this.allProducts.length > 0) {
        if (query && query.trim() !== '') {
          this.searching = true;
          setTimeout(() => { this.filterBySearchQuery(query); this.searching = false; }, 300);
        } else {
          this.searching = true;
          setTimeout(() => { this.applyFilters(); this.searching = false; }, 300);
        }
      }
    });
  }

  filterBySearchQuery(query: string): void {
    const searchLower = query.toLowerCase();
    this.applyFilters();
    this.filteredProducts = this.filteredProducts.filter(
      (p) => p.title.toLowerCase().includes(searchLower) ||
             p.vendor.toLowerCase().includes(searchLower) ||
             (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
    );
  }

  get isLoading(): boolean { return this.loading || this.searching; }

  loadProducts(): void {
    this.loading      = true;
    this.allProducts  = [];
    this.filteredProducts = [];

    const startTime     = Date.now();
    const minLoadingTime = 500;

    this.productService.getProductsByCollection(this.categoryId).subscribe({
      next: (result: any) => {
        const collection = result.data.collection;
        if (!collection) { this.loading = false; return; }

        this.categoryTitle       = collection.title;
        this.categoryDescription = collection.description || '';
        this.allProducts         = collection.products.nodes;

        // Update meta tags dynamically
        this.titleService.setTitle(`${collection.title} — GNET Computers Kenya`);
        this.meta.updateTag({ name: 'description', content: `Shop ${collection.title} at GNET Computers. Best prices in Kenya. Pay via M-Pesa.` });
        this.meta.updateTag({ property: 'og:title', content: `${collection.title} — GNET Computers Kenya` });

        this.extractFilterOptions();
        this.applyFilters();

        const elapsed   = Date.now() - startTime;
        const remaining = Math.max(0, minLoadingTime - elapsed);
        setTimeout(() => { this.loading = false; }, remaining);
      },
      error: () => { this.loading = false; },
    });
  }

  extractFilterOptions(): void {
    this.filterOptions.brands = [...new Set(this.allProducts.map((p) => p.vendor).filter((v) => v?.trim()))].sort();
    const allTags = this.allProducts.flatMap((p) => p.tags || []);
    this.filterOptions.tags = [...new Set(allTags)].filter((t) => t?.trim()).sort();
    const prices = this.allProducts.map((p) => parseFloat(p.priceRange.minVariantPrice.amount));
    if (prices.length > 0) {
      this.filterOptions.minPrice = Math.floor(Math.min(...prices));
      this.filterOptions.maxPrice = Math.ceil(Math.max(...prices));
      this.filterOptions.priceRanges = this.generatePriceRanges(this.filterOptions.minPrice, this.filterOptions.maxPrice);
    }
  }

  generatePriceRanges(min: number, max: number): any[] {
    const step = Math.ceil((max - min) / 4);
    return Array.from({ length: 4 }, (_, i) => {
      const rMin = min + step * i;
      const rMax = i === 3 ? max : min + step * (i + 1);
      return { label: i === 3 ? `KES ${rMin}+` : `KES ${rMin} - ${rMax}`, min: rMin, max: rMax, value: `${rMin}-${rMax}` };
    });
  }

  onFiltersChanged(filters: ActiveFilters): void { this.activeFilters = filters; this.applyFilters(); }

  applyFilters(): void {
    let filtered = [...this.allProducts];
    if (this.activeFilters.selectedPriceRanges.length > 0) {
      filtered = filtered.filter((p) => {
        const price = parseFloat(p.priceRange.minVariantPrice.amount);
        return this.activeFilters.selectedPriceRanges.some((rv) => {
          const pr = this.filterOptions.priceRanges.find((r) => r.value === rv);
          return pr && price >= pr.min && price <= pr.max;
        });
      });
    }
    if (this.activeFilters.selectedBrands.length > 0)
      filtered = filtered.filter((p) => this.activeFilters.selectedBrands.includes(p.vendor));
    if (this.activeFilters.selectedTags.length > 0)
      filtered = filtered.filter((p) => p.tags?.some((t) => this.activeFilters.selectedTags.includes(t)));
    if (this.activeFilters.showAvailableOnly)
      filtered = filtered.filter((p) => p.availableForSale);
    this.filteredProducts = this.sortProducts(filtered);
  }

  sortProducts(products: Product[]): Product[] {
    switch (this.sortBy) {
      case 'price-low':  return products.sort((a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount));
      case 'price-high': return products.sort((a, b) => parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount));
      case 'name-asc':   return products.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':  return products.sort((a, b) => b.title.localeCompare(a.title));
      default:           return products;
    }
  }

  onSortChange(): void { this.applyFilters(); }

  onClearFilters(): void {
    this.activeFilters = { selectedBrands: [], selectedTags: [], selectedPriceRanges: [], selectedColors: [], selectedSizes: [], showAvailableOnly: false };
    this.sortBy = 'default';
    this.applyFilters();
  }

  toggleMobileFilters(): void {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }
}
  closeMobileFilters(): void   { this.mobileFiltersOpen = false; }
  goHome(): void               { this.router.navigate(['/']); }

  get activeFilterCount(): number {
    return this.activeFilters.selectedBrands.length + this.activeFilters.selectedTags.length +
           this.activeFilters.selectedPriceRanges.length + (this.activeFilters.showAvailableOnly ? 1 : 0);
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }
}