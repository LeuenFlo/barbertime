import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-booking',
  imports: [],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Termin vereinbaren | Barber Time');
  }
}
