import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { PocketBaseService, Product } from '../../services/pocketbase.service';
import { Router } from '@angular/router';

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
  isLoading = false;
  productMessage: { type: 'success' | 'error', text: string } | null = null;

  constructor(
    private pocketBaseService: PocketBaseService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.pocketBaseService.isUserLoggedIn$;
  }

  async onLogin() {
    // Validierung der Eingabefelder
    if (!this.credentials.email && !this.credentials.password) {
      this.error = 'Bitte geben Sie Ihre Email und Ihr Passwort ein';
      return;
    }
    if (!this.credentials.email) {
      this.error = 'Bitte geben Sie Ihre Email-Adresse ein';
      return;
    }
    if (!this.credentials.password) {
      this.error = 'Bitte geben Sie Ihr Passwort ein';
      return;
    }

    // Email-Format überprüfen
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.credentials.email)) {
      this.error = 'Bitte geben Sie eine gültige Email-Adresse ein';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this.pocketBaseService.userLogin(this.credentials);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Spezifische Fehlerbehandlung für verschiedene Fehlertypen
      if (error.message === 'Ungültige Anmeldedaten') {
        this.error = 'Ungültige Email oder Passwort';
      } else if (error.status === 401 || error.status === 403) {
        this.error = 'Sie haben keine Berechtigung für diesen Bereich';
      } else if (error.status === 0 || error.message?.includes('Failed to fetch')) {
        this.error = 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung';
      } else if (error.data?.message) {
        // Spezifische Fehlermeldung vom Server
        this.error = error.data.message;
      } else if (error.message) {
        // Allgemeine Fehlermeldung
        this.error = error.message;
      } else {
        this.error = 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut';
      }
    } finally {
      this.isLoading = false;
      if (this.error) {
        // Formular zurücksetzen bei Fehler
        this.credentials.password = '';
      }
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
        this.productMessage = {
          type: 'error',
          text: 'Bitte füllen Sie alle Felder aus und fügen Sie mindestens ein Bild hinzu'
        };
        return;
      }

      this.productMessage = null;

      // Create product with images
      await this.pocketBaseService.addProduct(
        {
          ...this.newProduct,
          images: [] // Clear images array as we'll pass files separately
        }, 
        this.selectedFiles
      );

      // Show success message
      this.productMessage = {
        type: 'success',
        text: 'Produkt wurde erfolgreich erstellt'
      };

      // Reset form
      this.resetForm();
    } catch (error) {
      console.error('Error adding product:', error);
      this.productMessage = {
        type: 'error',
        text: error instanceof Error ? error.message : 'Fehler beim Erstellen des Produkts'
      };
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
    // Don't reset the success message when clearing the form
  }
}
