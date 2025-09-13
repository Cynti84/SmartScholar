import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-terms',
  imports: [CommonModule],
  templateUrl: './terms.html',
  styleUrl: './terms.scss',
})
export class Terms implements OnInit {
  // Table of contents items can be used in the template
  toc = [
    { id: 'intro', label: 'Introduction' },
    { id: 'acceptance', label: 'Acceptance of Terms' },
    { id: 'user-accounts', label: 'Accounts & Roles' },
    { id: 'provider-verification', label: 'Provider Verification' },
    { id: 'scholarship-listings', label: 'Scholarship Listings' },
    { id: 'user-responsibilities', label: 'User Responsibilities' },
    { id: 'privacy', label: 'Privacy & Data' },
    { id: 'intellectual-property', label: 'Intellectual Property' },
    { id: 'limitations', label: 'Limitation of Liability' },
    { id: 'termination', label: 'Termination' },
    { id: 'changes', label: 'Changes to Terms' },
    { id: 'contact', label: 'Contact' },
  ];

  currentHash = '';

  constructor(private router: Router, private location: Location) {}

  ngOnInit(): void {
    // If the page opens with a hash, scroll to it
    setTimeout(() => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        this.scrollTo(hash);
      }
    }, 50);
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // update URL hash without reloading
      this.location.replaceState(this.router.url.split('#')[0] + '#' + id);
      this.currentHash = id;
    }
  }

  printPage() {
    window.print();
  }

  // Optional: highlight current section while scrolling
  @HostListener('window:scroll', [])
  onWindowScroll() {
    for (const item of this.toc) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < 150) {
        this.currentHash = item.id;
        break;
      }
    }
  }
}
