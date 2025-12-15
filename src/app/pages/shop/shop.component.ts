import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/productService/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import {
  FilterSidebarComponent,
  FilterOptions,
  ActiveFilters,
} from '../../components/filter-sidebar/filter-sidebar.component';
import { ActivatedRoute, Router } from '@angular/router';


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
    SkeletonCardComponent,
    FilterSidebarComponent,
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
})
export class ShopComponent implements OnInit, OnDestroy {
  categoryId: string = '';
  categoryTitle: string = '';
  categoryDescription: string = '';

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  loading: boolean = true;
  mobileFiltersOpen: boolean = false;

  // Filter options extracted from Shopify data
  filterOptions: FilterOptions = {
    brands: [],
    tags: [],
    colors: [],
    sizes: [],
    priceRanges: [],
    minPrice: 0,
    maxPrice: 0,
  };

  // Active filter selections
  activeFilters: ActiveFilters = {
    selectedBrands: [],
    selectedTags: [],
    selectedPriceRanges: [],
    selectedColors: [],
    selectedSizes: [],
    showAvailableOnly: false,
  };

  sortBy: string = 'default';

  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

ngOnInit(): void {
  this.routeSubscription = this.route.queryParams.subscribe((params) => {
    const collectionId = params['collectionId'];

    if (!collectionId) {
      console.error('No collectionId provided in query params');
      return;
    }

    // This is already a valid Shopify GID
    this.categoryId = collectionId;

    this.loadProducts();
  });
}


  loadProducts(): void {
    this.loading = true;

    this.productService.getProductsByCollection(this.categoryId).subscribe({
      next: (result: any) => {
        const collection = result.data.collection;

        if (!collection) {
          console.error('Collection not found');
          this.loading = false;
          return;
        }

        this.categoryTitle = collection.title;
        this.categoryDescription = collection.description || '';
        this.allProducts = collection.products.nodes;

        // Extract filter options from products
        this.extractFilterOptions();

        // Apply filters (initially shows all)
        this.applyFilters();

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      },
    });
  }

  extractFilterOptions(): void {
    // Extract unique brands
    this.filterOptions.brands = [
      ...new Set(
        this.allProducts
          .map((p) => p.vendor)
          .filter((v) => v && v.trim() !== '')
      ),
    ].sort();

    // Extract unique tags (flatten all product tags)
    const allTags = this.allProducts.flatMap((p) => p.tags || []);
    this.filterOptions.tags = [...new Set(allTags)]
      .filter((tag) => tag && tag.trim() !== '')
      .sort();

    // Calculate price ranges based on actual product prices
    const prices = this.allProducts.map((p) =>
      parseFloat(p.priceRange.minVariantPrice.amount)
    );

    if (prices.length > 0) {
      this.filterOptions.minPrice = Math.floor(Math.min(...prices));
      this.filterOptions.maxPrice = Math.ceil(Math.max(...prices));

      // Generate dynamic price ranges
      this.filterOptions.priceRanges = this.generatePriceRanges(
        this.filterOptions.minPrice,
        this.filterOptions.maxPrice
      );
    }
  }

  generatePriceRanges(min: number, max: number): any[] {
    // Create 4-5 sensible price ranges based on min/max
    const range = max - min;
    const step = Math.ceil(range / 4);
    const ranges = [];

    for (let i = 0; i < 4; i++) {
      const rangeMin = min + step * i;
      const rangeMax = i === 3 ? max : min + step * (i + 1);

      ranges.push({
        label: i === 3 ? `$${rangeMin}+` : `$${rangeMin} - $${rangeMax}`,
        min: rangeMin,
        max: rangeMax,
        value: `${rangeMin}-${rangeMax}`,
      });
    }

    return ranges;
  }

  onFiltersChanged(filters: ActiveFilters): void {
    this.activeFilters = filters;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allProducts];

    // Filter by price
    if (this.activeFilters.selectedPriceRanges.length > 0) {
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        return this.activeFilters.selectedPriceRanges.some((rangeValue) => {
          const priceRange = this.filterOptions.priceRanges.find(
            (pr) => pr.value === rangeValue
          );
          return (
            priceRange && price >= priceRange.min && price <= priceRange.max
          );
        });
      });
    }

    // Filter by brand
    if (this.activeFilters.selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        this.activeFilters.selectedBrands.includes(product.vendor)
      );
    }

    // Filter by tags
    if (this.activeFilters.selectedTags.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.tags &&
          product.tags.some((tag) =>
            this.activeFilters.selectedTags.includes(tag)
          )
      );
    }

    // Filter by availability
    if (this.activeFilters.showAvailableOnly) {
      filtered = filtered.filter((product) => product.availableForSale);
    }

    // Sort products
    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
  }

  sortProducts(products: Product[]): Product[] {
    switch (this.sortBy) {
      case 'price-low':
        return products.sort(
          (a, b) =>
            parseFloat(a.priceRange.minVariantPrice.amount) -
            parseFloat(b.priceRange.minVariantPrice.amount)
        );
      case 'price-high':
        return products.sort(
          (a, b) =>
            parseFloat(b.priceRange.minVariantPrice.amount) -
            parseFloat(a.priceRange.minVariantPrice.amount)
        );
      case 'name-asc':
        return products.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':
        return products.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return products;
    }
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onClearFilters(): void {
    this.activeFilters = {
      selectedBrands: [],
      selectedTags: [],
      selectedPriceRanges: [],
      selectedColors: [],
      selectedSizes: [],
      showAvailableOnly: false,
    };
    this.sortBy = 'default';
    this.applyFilters();
  }

  toggleMobileFilters(): void {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }

  closeMobileFilters(): void {
    this.mobileFiltersOpen = false;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  get activeFilterCount(): number {
    return (
      this.activeFilters.selectedBrands.length +
      this.activeFilters.selectedTags.length +
      this.activeFilters.selectedPriceRanges.length +
      (this.activeFilters.showAvailableOnly ? 1 : 0)
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }
}
