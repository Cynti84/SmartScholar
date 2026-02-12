import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true,
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], criteria: { [key: string]: any }): any[] {
    if (!items) return [];
    return items.filter((item) =>
      Object.keys(criteria).every((key) => item[key] === criteria[key])
    );
  }
}
