import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CustomErrorHandlerService implements ErrorHandler {
  constructor(private snackBar: MatSnackBar, private ngZone: NgZone) {}

  handleError(error: Error & { error?: string; status?: number }): void {
    console.log(error);
    if (error.status && error.status === 401) {
      console.error(error.message || error.error);
      return;
    }
    console.error(error['error'] || error.message);
    this.ngZone.run(() => {
      this.snackBar.open(error['error'] || error.message, 'Закрыть', {
        duration: 1500,
      });
    });
  }
}
