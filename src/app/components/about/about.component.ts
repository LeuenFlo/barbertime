import { Component } from '@angular/core';
import { CtaSectionComponent } from '../../shared/cta-section/cta-section.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CtaSectionComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

}
