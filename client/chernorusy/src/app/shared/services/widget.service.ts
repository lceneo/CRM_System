import {Injectable} from "@angular/core";
import {config} from "../../../main";
import type {Customization} from '../../../../../../script-builder/customization'

@Injectable({
  providedIn: 'root',
})
export class WidgetService {
  private readonly isCustomizingDomKey = 'super-puper-widget-is-customizing';

  constructor() {
    const configScript = document.createElement('script');
    configScript.textContent = `
      window['${this.isCustomizingDomKey}'] = true;
    `
    document.body.appendChild(configScript);
    const script = document.createElement('script');
    script.src = `${config.protocol}://${config.apiUrl}/api/Vidjets/Script`;
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);
    console.log('скрипт добавлен')
  }

  show(t: boolean) {
    if (window.showWidget) {
      window.showWidget(t)
    } else {
      setTimeout(() => this.show(t), 10)
    }
  }
}

declare global {
interface Window {
  'super-puper-widget-is-customizing': boolean;
  showWidget: (show: boolean) => any;
  applyStylesWidget: (styles: Customization) => any;
}
}
