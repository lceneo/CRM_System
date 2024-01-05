import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {

  transform(base64: string): number {
    console.log(atob(base64.split(",")[1]).length / 1024 / 1024)
    return atob(base64.split(",")[1]).length / 1024 / 1024;
  }
}
