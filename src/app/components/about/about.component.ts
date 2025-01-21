import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CtaSectionComponent } from '../../shared/cta-section/cta-section.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, CtaSectionComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

}
