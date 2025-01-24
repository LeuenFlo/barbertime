import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chf',
  standalone: true
})
export class ChfPipe implements PipeTransform {
  transform(value: number): string {
    const hasNonZeroDecimals = value % 1 !== 0;
    return `${hasNonZeroDecimals ? value.toFixed(2) : Math.floor(value)} CHF`;
  }
} 