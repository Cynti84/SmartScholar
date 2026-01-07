import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.scss'
})
export class Forbidden {
  constructor(private router: Router) { }
  
  goHome() {
    this.router.navigate(['/'])
  }
}
