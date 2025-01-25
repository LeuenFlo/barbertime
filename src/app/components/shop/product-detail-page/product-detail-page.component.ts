import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PocketBaseService, Product } from '../../../services/pocketbase.service';
import { ChfPipe } from '../../../shared/pipes/chf.pipe';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, ChfPipe, RouterLink],
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.scss']
})
export class ProductDetailPageComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  isLoading = false;
  showLoading = false;
  private loadingTimeout: any;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private pocketBaseService: PocketBaseService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadProduct(params['id']);
    });
  }

  private loadProduct(id: string) {
    this.isLoading = true;
    
    // Start a timer to show loading after 300ms
    this.loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.showLoading = true;
      }
    }, 300);

    this.pocketBaseService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
        this.showLoading = false;
        clearTimeout(this.loadingTimeout);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading = false;
        this.showLoading = false;
        clearTimeout(this.loadingTimeout);
      }
    });
  }

  ngOnDestroy() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  nextImage(): void {
    if (this.product?.images && this.currentImageIndex < this.product.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  hasMultipleImages(): boolean {
    return (this.product?.images?.length ?? 0) > 1;
  }

  canShowPrevious(): boolean {
    return this.currentImageIndex > 0;
  }

  canShowNext(): boolean {
    return this.product?.images ? this.currentImageIndex < this.product.images.length - 1 : false;
  }
} 