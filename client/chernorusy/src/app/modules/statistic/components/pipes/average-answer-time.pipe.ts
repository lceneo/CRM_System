import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'averageAnswerTime',
  standalone: true
})
export class AverageAnswerTimePipe implements PipeTransform {

  transform(avgTimeMs: number): string {
    if (avgTimeMs === null) { return 'Нет чатов'; }
    else if (avgTimeMs! < 1000) { return '0 сек.'; }
    else if (avgTimeMs! >= 1000 && avgTimeMs! < 1000 * 60) { return `${Math.floor(avgTimeMs! / 1000)} сек.`; }
    else if (avgTimeMs! >= 1000 * 60 && avgTimeMs! < 1000 * 60 * 60) { return `${ Math.floor(avgTimeMs! / 1000 / 60)} мин.`; }
    else if (avgTimeMs! >= 1000 * 60 * 60) { return `${Math.floor(avgTimeMs! / 1000 / 60 / 60)} ч. ${Math.floor((avgTimeMs! / 1000 / 60) % 60)} мин.`; }
    else { return 'Ошибка'; }
  }

}
