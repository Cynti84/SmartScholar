import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';

export interface Scholarship {
  id: number;
  country: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

@Component({
  selector: 'app-landing',
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  // Scholarship data
  scholarships: Scholarship[] = [
    {
      id: 1,
      country: 'Kenya',
      title: 'Kenya Scholarship Program',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut tellus ut felis tempor.',
      image: 'scholarship-image.jpg',
      category: 'Education',
    },
    {
      id: 2,
      country: 'Spain',
      title: 'Spain Study Abroad',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut tellus ut felis tempor.',
      image: 'scholarship-image.jpg',
      category: 'Education',
    },
    {
      id: 3,
      country: 'Canada',
      title: 'Canadian Excellence Award',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut tellus ut felis tempor.',
      image: 'scholarship-image.jpg',
      category: 'Education',
    },
    {
      id: 4,
      country: 'Dubai',
      title: 'Dubai Future Leaders',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut tellus ut felis tempor.',
      image: 'scholarship-image.jpg',
      category: 'Education',
    },
    {
      id: 5,
      country: 'Canada',
      title: 'Innovation Scholarship',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut tellus ut felis tempor.',
      image: 'scholarship-image.jpg',
      category: 'Innovation',
    },
    {
      id: 6,
      country: 'Dubai',
      title: 'Technology Leaders Program',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut tellus ut felis tempor.',
      image: 'scholarship-image.jpg',
      category: 'Technology',
    },
  ];

  onScholarshipClick(scholarship: Scholarship): void {
    // Navigate to scholarship details
    console.log('Scholarship clicked:', scholarship);
  }
}
