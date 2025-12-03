import { Pipe, PipeTransform } from '@angular/core';

// Legacy stub pipe; returns value unchanged.
@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}
