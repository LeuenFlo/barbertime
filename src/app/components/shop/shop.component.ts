import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChfPipe } from '../../shared/pipes/chf.pipe';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'hair' | 'beard' | 'styling' | 'tools';
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ChfPipe, FormsModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent {
  selectedCategory: 'all' | 'hair' | 'beard' | 'styling' | 'tools' = 'all';
  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
    });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  products: Product[] = [
    // Tools/Geräte
    {
      id: 1,
      name: 'WAHL 5 Star Detailer T-Wide',
      description: 'Professioneller Haartrimmer für präzise Konturen und Details.',
      price: 114.95,
      icon: 'content_cut',
      category: 'tools'
    },
    {
      id: 2,
      name: 'WAHL Pro Super Taper Cordless',
      description: 'Kabelloser Profi-Haarschneider mit langer Akkulaufzeit.',
      price: 125.95,
      icon: 'power',
      category: 'tools'
    },
    {
      id: 3,
      name: 'Moser Nackenpinsel',
      description: 'Hochwertiger Nackenpinsel für die professionelle Anwendung.',
      price: 10,
      icon: 'brush',
      category: 'tools'
    },
    {
      id: 4,
      name: 'WAHL Blade Ice 4 In 1 Spray',
      description: 'Multifunktionales Pflegespray für Schneidsätze - kühlt, reinigt, ölt und desinfiziert.',
      price: 13,
      icon: 'sanitizer',
      category: 'tools'
    },
    {
      id: 5,
      name: 'Dear Barber Vintage-Koffer',
      description: 'Stilvoller Vintage-Koffer für die professionelle Aufbewahrung von Barber-Werkzeugen.',
      price: 34,
      icon: 'work',
      category: 'tools'
    },
    // Bartpflege
    {
      id: 6,
      name: 'XanitaliaPro Rasiermesser',
      description: 'Hochwertiges Rasiermesser aus Edelstahl für die traditionelle Rasur.',
      price: 17.90,
      icon: 'straighten',
      category: 'beard'
    },
    {
      id: 7,
      name: 'WAHL Mobile Shaver',
      description: 'Kompakter und leistungsstarker Rasierer für unterwegs.',
      price: 22,
      icon: 'electric_bolt',
      category: 'beard'
    },
    {
      id: 8,
      name: 'Panasonic ER-GP22',
      description: 'Wiederaufladbarer Profi-Haarschneider mit präziser Schneidleistung.',
      price: 102.20,
      icon: 'precision_manufacturing',
      category: 'tools'
    },
    // Neue Produkte - Haarpflege
    {
      id: 9,
      name: 'Redken Brews Shampoo',
      description: 'Tägliches Shampoo für Männer, reinigt und erfrischt.',
      price: 24.90,
      icon: 'water_drop',
      category: 'hair'
    },
    {
      id: 10,
      name: 'American Crew Conditioner',
      description: 'Feuchtigkeitsspendender Conditioner für geschmeidiges Haar.',
      price: 19.90,
      icon: 'opacity',
      category: 'hair'
    },
    {
      id: 11,
      name: 'Dear Barber Bartshampoo',
      description: 'Spezielles Shampoo für die tägliche Bartpflege.',
      price: 16.90,
      icon: 'wash',
      category: 'beard'
    },
    {
      id: 12,
      name: 'Dear Barber Bartöl',
      description: 'Hochwertiges Öl für einen gepflegten und weichen Bart.',
      price: 22.90,
      icon: 'water_drop',
      category: 'beard'
    },
    // Styling Produkte
    {
      id: 13,
      name: 'American Crew Fiber',
      description: 'Styling-Paste mit mattem Finish und starkem Halt.',
      price: 21.90,
      icon: 'format_paint',
      category: 'styling'
    },
    {
      id: 14,
      name: 'Dear Barber Pomade',
      description: 'Klassische Pomade für einen glänzenden Look.',
      price: 23.90,
      icon: 'style',
      category: 'styling'
    },
    {
      id: 15,
      name: 'STMNT Grooming Spray',
      description: 'Leichtes Styling-Spray für natürlichen Halt.',
      price: 25.90,
      icon: 'spray',
      category: 'styling'
    },
    {
      id: 16,
      name: 'Redken Brews Clay Pomade',
      description: 'Modellierende Clay-Pomade für matten Look.',
      price: 24.90,
      icon: 'format_paint',
      category: 'styling'
    },
    // Weitere Haarpflege
    {
      id: 17,
      name: 'Nioxin System 2 Shampoo',
      description: 'Professionelles Shampoo gegen Haarausfall.',
      price: 29.90,
      icon: 'water_drop',
      category: 'hair'
    },
    {
      id: 18,
      name: 'Redken Brews Mask',
      description: 'Intensive Pflegemaske für strapaziertes Haar.',
      price: 27.90,
      icon: 'spa',
      category: 'hair'
    },
    // Weitere Bartpflege
    {
      id: 19,
      name: 'Dear Barber Bartwachs',
      description: 'Styling-Wachs für den perfekten Bart-Look.',
      price: 18.90,
      icon: 'face',
      category: 'beard'
    },
    {
      id: 20,
      name: 'Bartbürste Premium',
      description: 'Hochwertige Bartbürste aus echtem Wildschweinborsten.',
      price: 29.90,
      icon: 'brush',
      category: 'beard'
    }
  ];

  get filteredProducts(): Product[] {
    return this.products
      .filter(product => this.selectedCategory === 'all' || product.category === this.selectedCategory)
      .filter(product => {
        if (!this.searchTerm) return true;
        const term = this.searchTerm.toLowerCase();
        return product.name.toLowerCase().includes(term) ||
               product.description.toLowerCase().includes(term);
      });
  }

  filterProducts(category: 'all' | 'hair' | 'beard' | 'styling' | 'tools'): void {
    this.selectedCategory = category;
  }
}
