import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppToastComponent } from './features/app-toast/app-toast.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');
    constructor(private router: Router) {}
  
  ngAfterViewInit() {
    this.router.events.subscribe((e) => {
      console.log('ROUTER EVENT:', e);
    });
  }
}

