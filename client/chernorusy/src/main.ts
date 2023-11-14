import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import {environmentDev} from "./environments/environment.dev";
import {Environment} from "./app/environment.interface";

declare let __config: Environment;

export const config = __config ?? environmentDev;
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
