import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: 'tools' | 'beard' | 'hair' | 'styling';
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class PocketBaseService {
  private pb: PocketBase;
  private isAdminLoggedIn = new BehaviorSubject<boolean>(false);
  isAdminLoggedIn$ = this.isAdminLoggedIn.asObservable();

  constructor() {
    this.pb = new PocketBase(environment.pocketbaseUrl);
    this.checkAdminSession();
  }

  private async checkAdminSession() {
    const isValid = this.pb.authStore.isValid;
    this.isAdminLoggedIn.next(isValid);
  }

  // Admin Authentication
  async adminLogin(credentials: AdminCredentials): Promise<boolean> {
    try {
      await this.pb.admins.authWithPassword(credentials.email, credentials.password);
      this.isAdminLoggedIn.next(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      this.isAdminLoggedIn.next(false);
      return false;
    }
  }

  async adminLogout(): Promise<void> {
    this.pb.authStore.clear();
    this.isAdminLoggedIn.next(false);
  }

  // Product Management
  getProducts(page: number = 1, perPage: number = 12): Observable<{items: Product[], totalItems: number, totalPages: number}> {
    return from(
      this.pb.collection('products').getList(page, perPage, {
        sort: '-created'
      })
    ).pipe(
      map(response => ({
        items: response.items.map(record => ({
          ...record,
          images: record['images'].map((image: string) => this.getImageUrl(record.id, image))
        })) as Product[],
        totalItems: response.totalItems,
        totalPages: response.totalPages
      }))
    );
  }

  getProduct(id: string): Observable<Product> {
    return from(
      this.pb.collection('products').getOne(id)
    ).pipe(
      map(record => ({
        ...record,
        images: record['images'].map((image: string) => this.getImageUrl(record.id, image))
      } as Product))
    );
  }

  getProductsByCategory(category: string, page: number = 1, perPage: number = 12): Observable<{items: Product[], totalItems: number, totalPages: number}> {
    return from(
      this.pb.collection('products').getList(page, perPage, {
        filter: `category = "${category}"`,
        sort: '-created'
      })
    ).pipe(
      map(response => ({
        items: response.items.map(record => ({
          ...record,
          images: record['images'].map((image: string) => this.getImageUrl(record.id, image))
        })) as Product[],
        totalItems: response.totalItems,
        totalPages: response.totalPages
      }))
    );
  }

  searchProducts(term: string, page: number = 1, perPage: number = 12): Observable<{items: Product[], totalItems: number, totalPages: number}> {
    return from(
      this.pb.collection('products').getList(page, perPage, {
        filter: `title ~ "${term}" || description ~ "${term}"`,
        sort: '-created'
      })
    ).pipe(
      map(response => ({
        items: response.items.map(record => ({
          ...record,
          images: record['images'].map((image: string) => this.getImageUrl(record.id, image))
        })) as Product[],
        totalItems: response.totalItems,
        totalPages: response.totalPages
      }))
    );
  }

  // Admin Product Management
  async addProduct(product: Omit<Product, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'>): Promise<Product> {
    const record = await this.pb.collection('products').create(product);
    return {
      ...record,
      images: record['images'].map((image: string) => this.getImageUrl(record.id, image))
    } as Product;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const record = await this.pb.collection('products').update(id, product);
    return {
      ...record,
      images: record['images'].map((image: string) => this.getImageUrl(record.id, image))
    } as Product;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.pb.collection('products').delete(id);
  }

  // Image Upload
  async uploadProductImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const record = await this.pb.collection('products').create(formData);
    return this.getImageUrl(record.id, record['image']);
  }

  // Helper method to get full image URL
  private getImageUrl(recordId: string, filename: string): string {
    return `${environment.pocketbaseUrl}/api/files/products/${recordId}/${filename}`;
  }
} 