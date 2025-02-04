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
  private isUserLoggedIn = new BehaviorSubject<boolean>(false);
  isUserLoggedIn$ = this.isUserLoggedIn.asObservable();

  constructor() {
    this.pb = new PocketBase(environment.pocketbaseUrl);
    this.isUserLoggedIn.next(this.pb.authStore.isValid);
  }

  // Admin Authentication
  async userLogin(credentials: AdminCredentials): Promise<boolean> {
    try {
      await this.pb.collection('_superusers').authWithPassword(credentials.email, credentials.password);
      this.isUserLoggedIn.next(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async userLogout(): Promise<void> {
    this.pb.authStore.clear();
    this.isUserLoggedIn.next(false);
  }

  // Product Management
  getProducts(page: number = 1, perPage: number = 12): Observable<{items: Product[], totalItems: number, totalPages: number}> {
    return from(
      this.pb.collection('barbertime_products').getList(page, perPage, {
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
      this.pb.collection('barbertime_products').getOne(id)
    ).pipe(
      map(record => ({
        ...record,
        images: record['images'].map((image: string) => this.getImageUrl(record.id, image))
      } as Product))
    );
  }

  getProductsByCategory(category: string, page: number = 1, perPage: number = 12): Observable<{items: Product[], totalItems: number, totalPages: number}> {
    return from(
      this.pb.collection('barbertime_products').getList(page, perPage, {
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
      this.pb.collection('barbertime_products').getList(page, perPage, {
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
  async addProduct(product: Omit<Product, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'>, files?: File[]): Promise<Product> {
    try {
      const formData = new FormData();
      
      // Add basic product data
      formData.append('title', product.title);
      formData.append('description', product.description);
      formData.append('price', product.price.toString());
      formData.append('category', product.category);
      
      // Add images if they exist
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('images', file);
        });
      }

      console.log('Creating product with FormData');

      // Create the record using FormData
      const record = await this.pb.collection('barbertime_products').create(formData);
      
      console.log('Created record:', record);

      // Return the formatted product
      return {
        id: record.id,
        collectionId: record.collectionId,
        collectionName: record.collectionName,
        title: record['title'],
        description: record['description'],
        price: record['price'],
        category: record['category'] as Product['category'],
        created: record['created'],
        updated: record['updated'],
        images: record['images'] ? record['images'].map((image: string) => this.getImageUrl(record.id, image)) : []
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, product: Partial<Product>, files?: File[]): Promise<Product> {
    const formData = new FormData();
    
    if (product.title) formData.append('title', product.title);
    if (product.description) formData.append('description', product.description);
    if (product.price) formData.append('price', product.price.toString());
    if (product.category) formData.append('category', product.category);
    
    if (files) {
      files.forEach(file => {
        formData.append('images', file);
      });
    }

    const record = await this.pb.collection('barbertime_products').update(id, formData);
    return {
      ...record,
      images: record['images'] ? record['images'].map((image: string) => this.getImageUrl(record.id, image)) : []
    } as Product;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.pb.collection('barbertime_products').delete(id);
  }

  // Helper method to get full image URL
  private getImageUrl(recordId: string, filename: string): string {
    return `${environment.pocketbaseUrl}/api/files/barbertime_products/${recordId}/${filename}`;
  }
} 