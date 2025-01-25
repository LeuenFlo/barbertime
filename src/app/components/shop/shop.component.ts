import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChfPipe } from '../../shared/pipes/chf.pipe';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { PocketBaseService, Product } from '../../services/pocketbase.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ChfPipe, TruncatePipe, FormsModule, RouterLink],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit, OnDestroy {
  selectedCategory: Product['category'] | null = null;
  searchTerm = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 12;
  isLoading = false;
  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  readonly categories = [
    { value: 'tools', label: 'Werkzeuge' },
    { value: 'beard', label: 'Bartpflege' },
    { value: 'hair', label: 'Haarpflege' },
    { value: 'styling', label: 'Styling' }
  ];

  constructor(
    private pocketBaseService: PocketBaseService
  ) {
    const searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.currentPage = 1;
        if (!term) return this.pocketBaseService.getProducts(this.currentPage, this.itemsPerPage);
        return this.pocketBaseService.searchProducts(term, this.currentPage, this.itemsPerPage);
      })
    ).subscribe(response => {
      this.products = response.items;
      this.filteredProducts = this.filterByCategory(response.items);
      this.totalPages = response.totalPages;
      this.totalItems = response.totalItems;
    });

    this.subscriptions.push(searchSubscription);
  }

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  private loadProducts() {
    this.isLoading = true;
    
    if (this.selectedCategory) {
      this.pocketBaseService.getProductsByCategory(this.selectedCategory, this.currentPage, this.itemsPerPage)
        .subscribe(response => {
          this.products = response.items;
          this.filteredProducts = response.items;
          this.totalPages = response.totalPages;
          this.totalItems = response.totalItems;
          this.isLoading = false;
        });
    } else if (this.searchTerm) {
      this.pocketBaseService.searchProducts(this.searchTerm, this.currentPage, this.itemsPerPage)
        .subscribe(response => {
          this.products = response.items;
          this.filteredProducts = this.filterByCategory(response.items);
          this.totalPages = response.totalPages;
          this.totalItems = response.totalItems;
          this.isLoading = false;
        });
    } else {
      this.pocketBaseService.getProducts(this.currentPage, this.itemsPerPage)
        .subscribe(response => {
          this.products = response.items;
          this.filteredProducts = this.filterByCategory(response.items);
          this.totalPages = response.totalPages;
          this.totalItems = response.totalItems;
          this.isLoading = false;
        });
    }
  }

  private filterByCategory(products: Product[]): Product[] {
    if (!this.selectedCategory) return products;
    return products.filter(product => product.category === this.selectedCategory);
  }

  filterProducts(category: Product['category'] | null): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.searchTerm = '';
    this.loadProducts();
  }

  loadPage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }
}
