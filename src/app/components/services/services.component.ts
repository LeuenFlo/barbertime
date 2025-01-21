import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CtaSectionComponent } from '../../shared/cta-section/cta-section.component';
import { ChfPipe } from '../../shared/pipes/chf.pipe';

interface Service {
  name: string;
  description: string;
  price: number;
}

interface ServiceCategory {
  title: string;
  icon: string;
  services: Service[];
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, CtaSectionComponent, ChfPipe],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent {
  serviceCategories: ServiceCategory[] = [
    {
      title: 'Haare',
      icon: 'fas fa-cut',
      services: [
        {
          name: 'Haarschnitt',
          description: 'Waschen, Schneiden und Styling nach Ihren Wünschen',
          price: 28
        },
        {
          name: 'Kinder Haarschnitt',
          description: 'Für Kinder bis 15 Jahre',
          price: 21
        },
        {
          name: 'AHV / Rentner',
          description: 'Spezieller Tarif für Senioren',
          price: 21
        },
        {
          name: 'Haare waschen',
          description: 'Professionelle Haarwäsche',
          price: 10
        }
      ]
    },
    {
      title: 'Bart',
      icon: 'fas fa-razor',
      services: [
        {
          name: 'Nassrasur',
          description: 'Klassische Nassrasur mit warmem Handtuch',
          price: 20
        },
        {
          name: 'Bart & Schneiden',
          description: 'Präzises Trimmen und Konturieren des Bartes',
          price: 20
        }
      ]
    },
    {
      title: 'Kombi-Angebote',
      icon: 'fas fa-star',
      services: [
        {
          name: 'Haarschnitt & Bart',
          description: 'Komplettservice für Haare und Bart',
          price: 39
        },
        {
          name: 'Haarschnitt, Bart & Augenbrauen',
          description: 'Umfassende Pflege für den perfekten Look',
          price: 44
        },
        {
          name: 'Haarschnitt und waschen',
          description: 'Haarschnitt inklusive Wäsche',
          price: 35
        }
      ]
    }
  ];
}
