import { Component, OnInit } from '@angular/core';
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
export class ProductDetailPageComponent implements OnInit {
  product?: Product;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private pocketBaseService: PocketBaseService
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.pocketBaseService.getProduct(productId).subscribe(
        product => this.product = product
      );
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