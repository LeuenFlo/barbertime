import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PocketBaseService, Product, AdminCredentials } from '../../services/pocketbase.service';
import { ChfPipe } from '../../shared/pipes/chf.pipe';

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
  selectedFile: File | null = null;
  editingProduct: Product | null = null;
  isLoggedIn$;

  constructor(private pocketBaseService: PocketBaseService) {
    this.isLoggedIn$ = this.pocketBaseService.isAdminLoggedIn$;
  }

  ngOnInit() {
    this.loadProducts();
  }

  async onLogin() {
    try {
      const success = await this.pocketBaseService.adminLogin(this.credentials);
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
      await this.pocketBaseService.adminLogout();
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
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  async onAddProduct() {
    try {
      if (this.selectedFile) {
        const imageUrl = await this.pocketBaseService.uploadProductImage(this.selectedFile);
        this.newProduct.images = [imageUrl];
      }

      await this.pocketBaseService.addProduct(this.newProduct);
      this.resetForm();
      this.loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Fehler beim Hinzufügen des Produkts');
    }
  }

  async onUpdateProduct() {
    if (!this.editingProduct) return;

    try {
      if (this.selectedFile) {
        const imageUrl = await this.pocketBaseService.uploadProductImage(this.selectedFile);
        this.editingProduct.images = [imageUrl];
      }

      await this.pocketBaseService.updateProduct(this.editingProduct.id, this.editingProduct);
      this.editingProduct = null;
      this.selectedFile = null;
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
    this.selectedFile = null;
  }

  private resetForm() {
    this.newProduct = {
      title: '',
      description: '',
      price: 0,
      images: [],
      category: 'tools'
    };
    this.selectedFile = null;
  }
}
