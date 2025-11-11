import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  deadline: string;
  matchPercentage: number;
  matchReasons: string[];
  description: string;
  eligibility: string[];
  requirements: string[];
  isBookmarked: boolean;
  location: string;
  category: string;
}

@Component({
  selector: 'app-recommendations',
  imports: [CommonModule, DashboardLayout],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.scss',
})
export class Recommendations {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Recommendations', route: '/student/recommendations' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
  ];
  scholarships: Scholarship[] = [
    {
      id: '1',
      name: 'Tech Excellence Scholarship 2025',
      provider: 'Global Tech Foundation',
      amount: '$5,000',
      deadline: '2025-12-31',
      matchPercentage: 96,
      matchReasons: [
        'Your computer science major aligns perfectly',
        'GPA exceeds minimum requirement by 0.5 points',
        'Your leadership experience matches criteria',
        'Location preference matches scholarship availability',
      ],
      description: 'Supporting outstanding students pursuing careers in technology and innovation.',
      eligibility: [
        'Enrolled in Computer Science or related field',
        'Minimum GPA of 3.5',
        'Demonstrated leadership skills',
        'Financial need',
      ],
      requirements: [
        'Personal statement (500 words)',
        'Two letters of recommendation',
        'Academic transcripts',
        'Resume/CV',
      ],
      isBookmarked: false,
      location: 'United States',
      category: 'Technology',
    },
    {
      id: '2',
      name: 'Women in STEM Scholarship',
      provider: 'STEM Equity Initiative',
      amount: '$7,500',
      deadline: '2025-11-30',
      matchPercentage: 92,
      matchReasons: [
        'Gender matches scholarship focus',
        'STEM field of study aligns',
        'Your community service hours exceed requirements',
        'Academic performance meets criteria',
      ],
      description:
        'Empowering women to excel in science, technology, engineering, and mathematics.',
      eligibility: [
        'Female identifying student',
        'STEM major',
        'Minimum GPA of 3.3',
        'Community involvement',
      ],
      requirements: [
        'Essay on women in STEM (750 words)',
        'Academic transcripts',
        'One faculty recommendation',
        'Project portfolio (optional)',
      ],
      isBookmarked: true,
      location: 'International',
      category: 'STEM',
    },
    {
      id: '3',
      name: 'Future Innovators Grant',
      provider: 'Innovation Fund',
      amount: '$3,000',
      deadline: '2026-01-15',
      matchPercentage: 88,
      matchReasons: [
        'Your innovation project aligns with grant focus',
        'Academic record meets standards',
        'Age range matches eligibility',
        'Research interest alignment',
      ],
      description: 'Funding innovative projects and research by undergraduate students.',
      eligibility: [
        'Undergraduate student',
        'Innovative project proposal',
        'Minimum GPA of 3.0',
        'Age 18-25',
      ],
      requirements: [
        'Project proposal (1000 words)',
        'Budget breakdown',
        'Faculty advisor endorsement',
        'Previous work samples',
      ],
      isBookmarked: false,
      location: 'United States',
      category: 'Innovation',
    },
  ];

  selectedScholarship: Scholarship | null = null;
  showDetails: boolean = false;

  ngOnInit(): void {
    // Load bookmarked status from localStorage
    this.loadBookmarks();
  }

  getMatchClass(percentage: number): string {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 70) return 'fair';
    return 'low';
  }

  toggleBookmark(scholarship: Scholarship): void {
    scholarship.isBookmarked = !scholarship.isBookmarked;
    this.saveBookmarks();
  }

  applyForScholarship(scholarship: Scholarship): void {
    alert(`Redirecting to application page for ${scholarship.name}`);
    // In real implementation: this.router.navigate(['/apply', scholarship.id]);
  }

  viewDetails(scholarship: Scholarship): void {
    this.selectedScholarship = scholarship;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedScholarship = null;
  }

  private saveBookmarks(): void {
    const bookmarkedIds = this.scholarships.filter((s) => s.isBookmarked).map((s) => s.id);
    localStorage.setItem('bookmarkedScholarships', JSON.stringify(bookmarkedIds));
  }

  private loadBookmarks(): void {
    const saved = localStorage.getItem('bookmarkedScholarships');
    if (saved) {
      const bookmarkedIds = JSON.parse(saved);
      this.scholarships.forEach((scholarship) => {
        scholarship.isBookmarked = bookmarkedIds.includes(scholarship.id);
      });
    }
  }

  formatDeadline(deadline: string): string {
    const date = new Date(deadline);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  getDaysUntilDeadline(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
