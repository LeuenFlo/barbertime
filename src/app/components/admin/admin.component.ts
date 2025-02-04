import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { PocketBaseService, Product } from '../../services/pocketbase.service';

interface ImagePreview {
  url: string;
  file: File;
}

type ProductCategory = 'tools' | 'beard' | 'hair' | 'styling';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  isLoggedIn$: Observable<boolean>;
  credentials = {
    email: '',
    password: ''
  };
  newProduct: Omit<Product, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'> = {
    title: '',
    description: '',
    price: 0,
    images: [],
    category: 'tools' as ProductCategory
  };
  selectedFiles: File[] = [];
  imagePreviews: ImagePreview[] = [];
  error: string | null = null;

  constructor(private pocketBaseService: PocketBaseService) {
    this.isLoggedIn$ = this.pocketBaseService.isUserLoggedIn$;
  }

  async onLogin() {
    try {
      await this.pocketBaseService.userLogin(this.credentials);
      this.error = null;
    } catch (error) {
      this.error = 'Ungültige Anmeldedaten';
    }
  }

  onLogout() {
    this.pocketBaseService.userLogout();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedFiles = [...this.selectedFiles, ...files];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push({
            url: e.target.result,
            file: file
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  async onAddProduct() {
    try {
      // Validate form
      if (!this.newProduct.title || 
          !this.newProduct.description || 
          !this.newProduct.category || 
          this.newProduct.price <= 0 || 
          this.selectedFiles.length === 0) {
        return;
      }

      // Create product with images
      await this.pocketBaseService.addProduct(
        {
          ...this.newProduct,
          images: [] // Clear images array as we'll pass files separately
        }, 
        this.selectedFiles
      );

      // Reset form
      this.resetForm();
    } catch (error) {
      console.error('Error adding product:', error);
      if (error instanceof Error) {
        alert(`Fehler beim Hinzufügen des Produkts: ${error.message}`);
      } else {
        alert('Fehler beim Hinzufügen des Produkts');
      }
    }
  }

  resetForm() {
    this.newProduct = {
      title: '',
      description: '',
      price: 0,
      images: [],
      category: 'tools' as ProductCategory
    };
    this.selectedFiles = [];
    this.imagePreviews = [];
  }
}
