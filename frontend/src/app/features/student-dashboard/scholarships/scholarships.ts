import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';

interface Scholarship {
  id: number;
  title: string;
  provider: string;
  country: string;
  level: string;
  fundingType: string;
  fieldOfStudy: string;
  amount: string;
  deadline: string;
  description: string;
  eligibility: string[];
  fundingDetails: string;
  requirements: string[];
  isSaved: boolean;
}

interface Filters {
  keyword: string;
  country: string;
  level: string;
  fundingType: string;
  fieldOfStudy: string;
  deadlineBefore: string;
}

@Component({
  selector: 'app-scholarships',
  imports: [CommonModule, DashboardLayout, FormsModule, ReactiveFormsModule],
  templateUrl: './scholarships.html',
  styleUrl: './scholarships.scss',
})
export class Scholarships {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Recommendations', route: '/student/recommendations' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
  ];

  scholarships: Scholarship[] = [];
  filteredScholarships: Scholarship[] = [];
  selectedScholarship: Scholarship | null = null;
  relatedScholarships: Scholarship[] = [];

  filters: Filters = {
    keyword: '',
    country: '',
    level: '',
    fundingType: '',
    fieldOfStudy: '',
    deadlineBefore: '',
  };

  countries: string[] = [
    'USA',
    'UK',
    'Canada',
    'Australia',
    'Germany',
    'Netherlands',
    'Sweden',
    'Singapore',
  ];
  levels: string[] = ['Undergraduate', 'Masters', 'PhD', 'Postdoctoral'];
  fundingTypes: string[] = ['Full Funding', 'Partial Funding', 'Tuition Waiver'];
  fieldsOfStudy: string[] = [
    'Engineering',
    'Computer Science',
    'Business',
    'Medicine',
    'Arts',
    'Sciences',
    'Social Sciences',
    'Law',
  ];

  sortBy: string = 'deadline';
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;

  showFilters: boolean = true;

  ngOnInit(): void {
    this.loadScholarships();
    this.applyFilters();
  }

  loadScholarships(): void {
    // Mock data - replace with API call
    this.scholarships = [
      {
        id: 1,
        title: 'Global Excellence Scholarship',
        provider: 'Stanford University',
        country: 'USA',
        level: 'Masters',
        fundingType: 'Full Funding',
        fieldOfStudy: 'Computer Science',
        amount: '$50,000/year',
        deadline: '2025-12-31',
        description:
          'The Global Excellence Scholarship is designed for outstanding international students who demonstrate exceptional academic achievement and leadership potential.',
        eligibility: [
          'International students only',
          'Minimum GPA of 3.7/4.0',
          'TOEFL score of 100+ or IELTS 7.0+',
          'Proven leadership experience',
        ],
        fundingDetails:
          'Full tuition coverage, monthly stipend of $2,500, health insurance, and research funding up to $5,000 annually.',
        requirements: [
          'Completed application form',
          'Academic transcripts',
          'Two letters of recommendation',
          'Statement of purpose (1000 words)',
          'CV/Resume',
        ],
        isSaved: false,
      },
      {
        id: 2,
        title: 'Commonwealth Masters Scholarship',
        provider: 'UK Government',
        country: 'UK',
        level: 'Masters',
        fundingType: 'Full Funding',
        fieldOfStudy: 'Engineering',
        amount: '£30,000',
        deadline: '2025-11-15',
        description:
          'Commonwealth Scholarships support students from developing Commonwealth countries to pursue Masters degrees in the UK.',
        eligibility: [
          'Citizens of eligible Commonwealth countries',
          'First-class undergraduate degree',
          'Unable to afford UK studies',
          'Committed to development impact',
        ],
        fundingDetails:
          'Full tuition fees, return airfare, living allowance of £1,347/month, thesis grant, and arrival allowance.',
        requirements: [
          'Online application',
          'Development impact statement',
          'Two references',
          'Academic transcripts',
          'Proof of citizenship',
        ],
        isSaved: true,
      },
      {
        id: 3,
        title: 'Vanier Canada Graduate Scholarship',
        provider: 'Government of Canada',
        country: 'Canada',
        level: 'PhD',
        fundingType: 'Full Funding',
        fieldOfStudy: 'Sciences',
        amount: '$50,000 CAD/year',
        deadline: '2025-12-01',
        description:
          'The Vanier CGS program aims to attract and retain world-class doctoral students by supporting those who demonstrate leadership skills and a high standard of scholarly achievement.',
        eligibility: [
          'Nominated by Canadian institution',
          'Excellent academic record',
          'Leadership capabilities',
          'Research potential',
        ],
        fundingDetails: '$50,000 per year for three years of doctoral studies. Non-renewable.',
        requirements: [
          'Nomination by university',
          'Research proposal',
          'Leadership statement',
          'Three reference letters',
          'Complete academic record',
        ],
        isSaved: false,
      },
      {
        id: 4,
        title: 'Australia Awards Scholarship',
        provider: 'Australian Government',
        country: 'Australia',
        level: 'Masters',
        fundingType: 'Full Funding',
        fieldOfStudy: 'Business',
        amount: 'Full Coverage',
        deadline: '2026-01-30',
        description:
          'Australia Awards Scholarships provide opportunities for people from developing countries to undertake full-time undergraduate or postgraduate study at participating Australian universities.',
        eligibility: [
          'Citizens of eligible countries',
          'Minimum two years work experience',
          'Meet English language requirements',
          'Not hold Australian citizenship',
        ],
        fundingDetails:
          'Full tuition, return air travel, establishment allowance, contribution to living expenses, health cover.',
        requirements: [
          'Online application form',
          'Academic transcripts',
          'Employment references',
          'English test scores',
          'Statement of purpose',
        ],
        isSaved: false,
      },
      {
        id: 5,
        title: 'DAAD Scholarship',
        provider: 'German Academic Exchange Service',
        country: 'Germany',
        level: 'Masters',
        fundingType: 'Partial Funding',
        fieldOfStudy: 'Engineering',
        amount: '€934/month',
        deadline: '2025-11-30',
        description:
          'DAAD scholarships support highly qualified international students to pursue Masters degrees at German universities.',
        eligibility: [
          'Undergraduate degree completed',
          'At least two years work experience',
          'German or English proficiency',
          'Clear career development plan',
        ],
        fundingDetails:
          'Monthly stipend of €934, health insurance, travel allowance. Tuition fees covered at public universities.',
        requirements: [
          'DAAD application portal',
          'Letter of motivation',
          'University transcripts',
          'Two reference letters',
          'Language certificate',
        ],
        isSaved: false,
      },
      {
        id: 6,
        title: 'Erasmus Mundus Joint Masters',
        provider: 'European Union',
        country: 'Netherlands',
        level: 'Masters',
        fundingType: 'Full Funding',
        fieldOfStudy: 'Arts',
        amount: '€25,000',
        deadline: '2026-01-15',
        description:
          'Erasmus Mundus provides scholarships for students to study integrated Masters programmes offered by consortia of European universities.',
        eligibility: [
          'Any nationality eligible',
          'Bachelors degree or equivalent',
          'Meet consortium requirements',
          'English proficiency',
        ],
        fundingDetails:
          'Monthly allowance, participation costs, travel and installation costs, insurance coverage.',
        requirements: [
          'Programme-specific application',
          'Academic records',
          'Motivation letter',
          'Two recommendations',
          'Language certificates',
        ],
        isSaved: true,
      },
      {
        id: 7,
        title: 'Swedish Institute Scholarship',
        provider: 'Swedish Institute',
        country: 'Sweden',
        level: 'Masters',
        fundingType: 'Full Funding',
        fieldOfStudy: 'Social Sciences',
        amount: 'Full Coverage',
        deadline: '2026-02-20',
        description:
          'SISGP offers scholarships for global professionals from eligible countries to pursue Masters programmes in Sweden.',
        eligibility: [
          'Citizens of eligible countries',
          'Demonstrated leadership experience',
          'Work experience required',
          'Meet university admission requirements',
        ],
        fundingDetails:
          'Full tuition, living expenses (15,000 SEK/month), travel grant, insurance.',
        requirements: [
          'Online application',
          'CV and motivation letter',
          'Two recommendation letters',
          'University admission',
          'Leadership essay',
        ],
        isSaved: false,
      },
      {
        id: 8,
        title: 'Singapore International Graduate Award',
        provider: 'Agency for Science, Technology and Research',
        country: 'Singapore',
        level: 'PhD',
        fundingType: 'Full Funding',
        fieldOfStudy: 'Sciences',
        amount: 'S$2,500/month',
        deadline: '2025-12-01',
        description:
          'SINGA supports international students to pursue PhD studies in science and engineering at leading Singapore institutions.',
        eligibility: [
          'Excellent academic record',
          'Passion for research',
          'Good communication skills',
          'International applicants',
        ],
        fundingDetails:
          'Monthly stipend of S$2,500-3,200, tuition fees, one-time airfare grant, settling-in allowance.',
        requirements: [
          'Online application',
          'Academic transcripts',
          'Research proposal',
          'Two reference letters',
          'English proficiency proof',
        ],
        isSaved: false,
      },
      {
        id: 9,
        title: 'Rhodes Scholarship',
        provider: 'Rhodes Trust',
        country: 'UK',
        level: 'Masters',
        fundingType: 'Full Funding',
        fieldOfStudy: 'Law',
        amount: 'Full Coverage',
        deadline: '2025-10-01',
        description:
          'The Rhodes Scholarship is one of the oldest and most prestigious international scholarship programmes, enabling outstanding young people to study at Oxford.',
        eligibility: [
          'Age 18-28',
          'Exceptional academic achievement',
          'Leadership and service',
          'Citizens of eligible countries',
        ],
        fundingDetails:
          'University and college fees, annual stipend, health insurance, settling-in allowance, return economy airfare.',
        requirements: [
          'Online application',
          'Personal statement',
          'Four to eight references',
          'Academic transcripts',
          'Interview (if shortlisted)',
        ],
        isSaved: false,
      },
    ];
  }

  applyFilters(): void {
    let filtered = [...this.scholarships];

    // Keyword filter
    if (this.filters.keyword) {
      const keyword = this.filters.keyword.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(keyword) ||
          s.provider.toLowerCase().includes(keyword) ||
          s.fieldOfStudy.toLowerCase().includes(keyword) ||
          s.description.toLowerCase().includes(keyword)
      );
    }

    // Country filter
    if (this.filters.country) {
      filtered = filtered.filter((s) => s.country === this.filters.country);
    }

    // Level filter
    if (this.filters.level) {
      filtered = filtered.filter((s) => s.level === this.filters.level);
    }

    // Funding type filter
    if (this.filters.fundingType) {
      filtered = filtered.filter((s) => s.fundingType === this.filters.fundingType);
    }

    // Field of study filter
    if (this.filters.fieldOfStudy) {
      filtered = filtered.filter((s) => s.fieldOfStudy === this.filters.fieldOfStudy);
    }

    // Deadline filter
    if (this.filters.deadlineBefore) {
      filtered = filtered.filter(
        (s) => new Date(s.deadline) <= new Date(this.filters.deadlineBefore)
      );
    }

    // Sort
    this.sortScholarships(filtered);

    this.filteredScholarships = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  sortScholarships(scholarships: Scholarship[]): void {
    scholarships.sort((a, b) => {
      switch (this.sortBy) {
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'amount':
          return this.extractAmount(b.amount) - this.extractAmount(a.amount);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }

  extractAmount(amount: string): number {
    const match = amount.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  }

  clearFilters(): void {
    this.filters = {
      keyword: '',
      country: '',
      level: '',
      fundingType: '',
      fieldOfStudy: '',
      deadlineBefore: '',
    };
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  getPaginatedScholarships(): Scholarship[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredScholarships.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewScholarship(scholarship: Scholarship): void {
    this.selectedScholarship = scholarship;
    this.loadRelatedScholarships(scholarship);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadRelatedScholarships(scholarship: Scholarship): void {
    this.relatedScholarships = this.scholarships
      .filter(
        (s) =>
          s.id !== scholarship.id &&
          (s.level === scholarship.level ||
            s.fieldOfStudy === scholarship.fieldOfStudy ||
            s.country === scholarship.country)
      )
      .slice(0, 3);
  }

  backToList(): void {
    this.selectedScholarship = null;
  }

  toggleSave(scholarship: Scholarship): void {
    scholarship.isSaved = !scholarship.isSaved;
  }

  applyScholarship(scholarship: Scholarship): void {
    console.log('Applying for scholarship:', scholarship.title);
    // Implement application logic
  }

  getDaysRemaining(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
}
