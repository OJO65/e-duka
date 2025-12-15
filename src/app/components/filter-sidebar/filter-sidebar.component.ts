import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOptions {
  brands: string[];
  colors: string[];
  sizes: string[];
  tags: string[];
  priceRanges: PriceRange[];
  minPrice: number;
  maxPrice: number;
}

export interface PriceRange {
  label: string;
  min: number;
  max: number;
  value: string;
}

export interface ActiveFilters {
  selectedBrands: string[];
  selectedColors: string[];
  selectedSizes: string[];
  selectedTags: string[];
  selectedPriceRanges: string[];
  showAvailableOnly: boolean;
}

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.css'],
})
export class FilterSidebarComponent {
  @Input() filterOptions!: FilterOptions;
  @Input() activeFilters!: ActiveFilters;
  @Input() isMobile: boolean = false;

  @Output() filtersChanged = new EventEmitter<ActiveFilters>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  onBrandChange(brand: string, checked: boolean) {
    if (checked) {
      this.activeFilters.selectedBrands.push(brand);
    } else {
      this.activeFilters.selectedBrands =
        this.activeFilters.selectedBrands.filter((b) => b !== brand);
    }
    this.emitFilters();
  }

  onPriceRangeChange(rangeValue: string, checked: boolean) {
    if (checked) {
      this.activeFilters.selectedPriceRanges.push(rangeValue);
    } else {
      this.activeFilters.selectedPriceRanges =
        this.activeFilters.selectedPriceRanges.filter((r) => r !== rangeValue);
    }
    this.emitFilters();
  }

  onColorChange(color: string, checked: boolean) {
    if (checked) {
      this.activeFilters.selectedColors.push(color);
    } else {
      this.activeFilters.selectedColors =
        this.activeFilters.selectedColors.filter((c) => c !== color);
    }
    this.emitFilters();
  }

  onSizeChange(size: string, checked: boolean) {
    if (checked) {
      this.activeFilters.selectedSizes.push(size);
    } else {
      this.activeFilters.selectedSizes =
        this.activeFilters.selectedSizes.filter((s) => s !== size);
    }
    this.emitFilters();
  }

  onTagChange(tag: string, checked: boolean) {
    if (checked) {
      this.activeFilters.selectedTags.push(tag);
    } else {
      this.activeFilters.selectedTags = this.activeFilters.selectedTags.filter(
        (t) => t !== tag
      );
    }
    this.emitFilters();
  }

  onAvailabilityChange(): void {
    this.emitFilters();
  }

  emitFilters(): void {
    this.filtersChanged.emit(this.activeFilters);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  onClose(): void {
    this.closeModal.emit();
  }

  get hasActiveFilters(): boolean {
    return (
      this.activeFilters.selectedBrands.length > 0 ||
      this.activeFilters.selectedColors.length > 0 ||
      this.activeFilters.selectedSizes.length > 0 ||
      this.activeFilters.selectedTags.length > 0 ||
      this.activeFilters.selectedPriceRanges.length > 0 ||
      this.activeFilters.showAvailableOnly
    );
  }

  isBrandSelected(brand: string): boolean {
    return this.activeFilters.selectedBrands.includes(brand);
  }

  isColorSelected(color: string): boolean {
    return this.activeFilters.selectedColors.includes(color);
  }

  isSizeSelected(size: string): boolean {
    return this.activeFilters.selectedSizes.includes(size);
  }

  isTagSelected(tag: string): boolean {
    return this.activeFilters.selectedTags.includes(tag);
  }

  isPriceRangeSelected(rangeValue: string): boolean {
    return this.activeFilters.selectedPriceRanges.includes(rangeValue);
  }
}
