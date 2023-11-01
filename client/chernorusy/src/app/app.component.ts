import {ChangeDetectionStrategy, Component} from '@angular/core';
import {HttpService} from "./shared/services/http.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'chernorusy';
  constructor(private httpS: HttpService) {
    httpS.post('/Accounts/Register', {}).subscribe()
  }
}
