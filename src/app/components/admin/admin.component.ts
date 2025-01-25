import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PocketBaseService, Product, AdminCredentials } from '../../services/pocketbase.service';
import { ChfPipe } from '../../shared/pipes/chf.pipe';

interface ImagePreview {
  url: string;
  file: File;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ChfPipe],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  products: Product[] = [];
  credentials: AdminCredentials = { email: '', password: '' };
  newProduct: Omit<Product, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'> = {
    title: '',
    description: '',
    price: 0,
    images: [],
    category: 'tools'
  };
  selectedFiles: File[] = [];
  imagePreviews: ImagePreview[] = [];
  editingProduct: Product | null = null;
  isLoggedIn$;

  constructor(private pocketBaseService: PocketBaseService) {
    this.isLoggedIn$ = this.pocketBaseService.isUserLoggedIn$;
  }

  ngOnInit() {
    this.loadProducts();
  }

  async onLogin() {
    try {
      const success = await this.pocketBaseService.userLogin(this.credentials);
      if (success) {
        this.credentials = { email: '', password: '' };
      } else {
        alert('Login fehlgeschlagen');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login fehlgeschlagen');
    }
  }

  async onLogout() {
    try {
      await this.pocketBaseService.userLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  private loadProducts() {
    this.pocketBaseService.getProducts(1, 100)  // Load more products per page for admin view
      .subscribe(response => {
        this.products = response.items;
      });
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

      console.log('Attempting to create product with:', {
        product: this.newProduct,
        files: this.selectedFiles
      });

      // Create product with images
      const product = await this.pocketBaseService.addProduct(
        {
          ...this.newProduct,
          images: [] // Clear images array as we'll pass files separately
        }, 
        this.selectedFiles
      );
      
      console.log('Created product:', product);

      // Reset form and reload products
      this.resetForm();
      this.loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      if (error instanceof Error) {
        alert(`Fehler beim Hinzufügen des Produkts: ${error.message}`);
      } else {
        alert('Fehler beim Hinzufügen des Produkts');
      }
    }
  }

  async onUpdateProduct() {
    if (!this.editingProduct) return;

    try {
      const product = await this.pocketBaseService.updateProduct(
        this.editingProduct.id, 
        this.editingProduct,
        this.selectedFiles.length > 0 ? this.selectedFiles : undefined
      );
      console.log('Updated product:', product);
      
      this.editingProduct = null;
      this.selectedFiles = [];
      this.imagePreviews = [];
      this.loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Fehler beim Aktualisieren des Produkts');
    }
  }

  async onDeleteProduct(id: string) {
    if (!confirm('Möchten Sie dieses Produkt wirklich löschen?')) return;

    try {
      await this.pocketBaseService.deleteProduct(id);
      this.loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Fehler beim Löschen des Produkts');
    }
  }

  startEditing(product: Product) {
    this.editingProduct = { ...product };
  }

  cancelEditing() {
    this.editingProduct = null;
    this.selectedFiles = [];
    this.imagePreviews = [];
  }

  private resetForm() {
    this.newProduct = {
      title: '',
      description: '',
      price: 0,
      images: [],
      category: 'tools'
    };
    this.selectedFiles = [];
    this.imagePreviews = [];
  }
}
