import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface Scholarship {
  id: string;
  title: string;
}

interface SummaryStats {
  totalApplied: number;
  mostPopular: {
    title: string;
    count: number;
  };
  deadlineSoonest: {
    title: string;
    daysLeft: number;
  };
}

interface EducationData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface ScholarshipTableData {
  title: string;
  totalApplied: number;
  topField: string;
  topCountry: string;
}

@Component({
  selector: 'app-applicants',
  imports: [CommonModule, DashboardLayout, FormsModule],
  templateUrl: './applicants.html',
  styleUrl: './applicants.scss',
})
export class Applicants implements OnInit, AfterViewInit {
  //menu items
  menu = [
    { label: 'Overview', route: '/provider' },
    { label: 'Post Scholarships', route: '/provider/post' },
    { label: 'Manage Scholarships', route: '/provider/manage' },
    { label: 'Applicants', route: '/provider/applicants' },
    { label: 'Profile', route: '/provider/profile' },
  ];

  @ViewChild('educationChart', { static: false }) educationChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fieldChart', { static: false }) fieldChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('countryChart', { static: false }) countryChartRef!: ElementRef<HTMLCanvasElement>;

  selectedScholarship: string = 'all';
  scholarships: Scholarship[] = [];
  summaryStats: SummaryStats = {
    totalApplied: 0,
    mostPopular: { title: '', count: 0 },
    deadlineSoonest: { title: '', daysLeft: 0 },
  };

  educationData: EducationData[] = [];
  scholarshipTableData: ScholarshipTableData[] = [];

  private educationChart?: Chart;
  private fieldChart?: Chart;
  private countryChart?: Chart;

  // Mock data - replace with actual service calls
  private mockData = {
    scholarships: [
      { id: '1', title: 'DAAD Masters 2025' },
      { id: '2', title: 'Chevening 2025' },
      { id: '3', title: 'Fulbright 2025' },
      { id: '4', title: 'Commonwealth Scholarship' },
      { id: '5', title: 'Gates Cambridge' },
    ],
    summaryStats: {
      totalApplied: 126,
      mostPopular: { title: 'DAAD Masters 2025', count: 42 },
      deadlineSoonest: { title: 'Chevening 2025', daysLeft: 5 },
    },
    educationLevels: [
      { label: 'Undergraduate', value: 50, percentage: 40, color: '#3b82f6' },
      { label: 'Masters', value: 57, percentage: 45, color: '#10b981' },
      { label: 'PhD', value: 19, percentage: 15, color: '#f59e0b' },
    ],
    fieldsOfStudy: [
      { label: 'Engineering', value: 35 },
      { label: 'Business', value: 28 },
      { label: 'Medicine', value: 22 },
      { label: 'Computer Science', value: 18 },
      { label: 'Social Sciences', value: 15 },
      { label: 'Arts & Humanities', value: 8 },
    ],
    countries: [
      { label: 'Nigeria', value: 25 },
      { label: 'Kenya', value: 20 },
      { label: 'South Africa', value: 18 },
      { label: 'Ghana', value: 15 },
      { label: 'Uganda', value: 12 },
      { label: 'Tanzania', value: 10 },
      { label: 'Others', value: 26 },
    ],
    scholarshipTable: [
      {
        title: 'DAAD Masters 2025',
        totalApplied: 42,
        topField: 'Engineering',
        topCountry: 'Nigeria',
      },
      { title: 'Chevening 2025', totalApplied: 28, topField: 'Business', topCountry: 'Kenya' },
      {
        title: 'Fulbright 2025',
        totalApplied: 23,
        topField: 'Computer Science',
        topCountry: 'South Africa',
      },
      {
        title: 'Commonwealth Scholarship',
        totalApplied: 19,
        topField: 'Medicine',
        topCountry: 'Ghana',
      },
      {
        title: 'Gates Cambridge',
        totalApplied: 14,
        topField: 'Social Sciences',
        topCountry: 'Uganda',
      },
    ],
  };

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngAfterViewInit(): void {
    // Small delay to ensure DOM is fully rendered
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private loadInitialData(): void {
    // In a real application, these would be service calls
    this.scholarships = this.mockData.scholarships;
    this.summaryStats = this.mockData.summaryStats;
    this.educationData = this.mockData.educationLevels;
    this.scholarshipTableData = this.mockData.scholarshipTable;
  }

  onScholarshipChange(): void {
    // Reload data based on selected scholarship
    this.loadDataForScholarship(this.selectedScholarship);
    this.updateCharts();
  }

  private loadDataForScholarship(scholarshipId: string): void {
    // In a real application, this would filter data based on scholarship
    // For now, we'll use the same mock data
    if (scholarshipId === 'all') {
      this.summaryStats = this.mockData.summaryStats;
      this.scholarshipTableData = this.mockData.scholarshipTable;
    } else {
      // Filter data for specific scholarship
      const selectedScholarship = this.scholarships.find((s) => s.id === scholarshipId);
      if (selectedScholarship) {
        this.summaryStats = {
          ...this.mockData.summaryStats,
          totalApplied: Math.floor(this.mockData.summaryStats.totalApplied * 0.3), // Simulate filtered data
          mostPopular: { title: selectedScholarship.title, count: 42 },
        };
        this.scholarshipTableData = this.mockData.scholarshipTable.filter(
          (item) => item.title === selectedScholarship.title
        );
      }
    }
  }

  private initializeCharts(): void {
    this.createEducationChart();
    this.createFieldChart();
    this.createCountryChart();
  }

  private createEducationChart(): void {
    if (!this.educationChartRef?.nativeElement) return;

    const ctx = this.educationChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: this.educationData.map((item) => item.label),
        datasets: [
          {
            data: this.educationData.map((item) => item.value),
            backgroundColor: this.educationData.map((item) => item.color),
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const percentage = Math.round((value / this.summaryStats.totalApplied) * 100);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
        cutout: '60%',
        elements: {
          arc: {
            borderWidth: 0,
          },
        },
      },
    };

    this.educationChart = new Chart(ctx, config);
  }

  private createFieldChart(): void {
    if (!this.fieldChartRef?.nativeElement) return;

    const ctx = this.fieldChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: this.mockData.fieldsOfStudy.map((item) => item.label),
        datasets: [
          {
            data: this.mockData.fieldsOfStudy.map((item) => item.value),
            backgroundColor: '#3b82f6',
            borderRadius: 4,
            maxBarThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9',
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 45,
            },
          },
        },
      },
    };

    this.fieldChart = new Chart(ctx, config);
  }

  private createCountryChart(): void {
    if (!this.countryChartRef?.nativeElement) return;

    const ctx = this.countryChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: this.mockData.countries.map((item) => item.label),
        datasets: [
          {
            data: this.mockData.countries.map((item) => item.value),
            backgroundColor: '#10b981',
            borderRadius: 4,
            maxBarThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9',
            },
          },
          y: {
            grid: {
              display: false,
            },
          },
        },
      },
    };

    this.countryChart = new Chart(ctx, config);
  }

  private updateCharts(): void {
    // Update chart data when scholarship filter changes
    if (this.educationChart) {
      this.educationChart.update();
    }
    if (this.fieldChart) {
      this.fieldChart.update();
    }
    if (this.countryChart) {
      this.countryChart.update();
    }
  }

  ngOnDestroy(): void {
    // Clean up chart instances
    if (this.educationChart) {
      this.educationChart.destroy();
    }
    if (this.fieldChart) {
      this.fieldChart.destroy();
    }
    if (this.countryChart) {
      this.countryChart.destroy();
    }
  }
}
