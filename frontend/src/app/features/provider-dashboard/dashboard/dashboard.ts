import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { Card } from '../../../shared/components/card/card';

interface StatCard{
  count: number;
  percentage: string;
  trend: 'up' | 'down';

}

interface Scholarship{
  name: string
  datePosted: Date
  applicationCount: number
  status: 'Active' | 'Inactive'
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DashboardLayout, Card],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('pieChart', { static: false }) pieChart!: ElementRef<HTMLCanvasElement>;

  /**
   * Menu Data
   */
  menu = [
    { label: 'Overview', route: '/provider' },
    { label: 'Post Scholarships', route: '/provider/post' },
    { label: 'Manage Scholarships', route: '/provider/manage' },
    { label: 'Applicants', route: '/provider/applicants' },
    { label: 'Profile', route: '/provider/profile' },
  ];

  // Stats Data
  approvedScholarships: StatCard = {
    count: 2456,
    percentage: '+2.5%',
    trend: 'up',
  };

  pendingScholarships: StatCard = {
    count: 4561,
    percentage: '-4.4%',
    trend: 'down',
  };

  studentsApplied: StatCard = {
    count: 125,
    percentage: '+1.5%',
    trend: 'up',
  };

  totalScholarships: StatCard = {
    count: 2456,
    percentage: '+4.5%',
    trend: 'up',
  };

  // Table Data
  scholarships: Scholarship[] = [
    {
      name: 'Masters',
      datePosted: new Date('2025-12-24'),
      applicationCount: 135,
      status: 'Active',
    },
    {
      name: 'Agriculture Scholarship',
      datePosted: new Date('2025-06-13'),
      applicationCount: 100,
      status: 'Inactive',
    },
    {
      name: 'BSC Computer Science masters',
      datePosted: new Date('2025-09-05'),
      applicationCount: 95,
      status: 'Active',
    },
    {
      name: 'Business Scholarship',
      datePosted: new Date('2025-09-12'),
      applicationCount: 45,
      status: 'Active',
    },
    {
      name: 'Masters',
      datePosted: new Date('2025-05-12'),
      applicationCount: 96,
      status: 'Inactive',
    },
  ];

  activeFilter: 'monthly' | 'weekly' | 'today' = 'today';
  filteredScholarships: Scholarship[] = [];

  // Chart Data
  chartData = {
    marked: { value: 942, percentage: 2.5 },
    total: { value: 25, percentage: 0.4 },
    approved: { value: 15, percentage: -0.5 },
  };

  constructor() {}

  ngOnInit(): void {
    this.filterScholarships();
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  setFilter(filter: 'monthly' | 'weekly' | 'today'): void {
    this.activeFilter = filter;
    this.filterScholarships();
  }

  private filterScholarships(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (this.activeFilter) {
      case 'today':
        this.filteredScholarships = this.scholarships.filter(
          (scholarship) => scholarship.datePosted >= today
        );
        break;
      case 'weekly':
        this.filteredScholarships = this.scholarships.filter(
          (scholarship) => scholarship.datePosted >= weekAgo
        );
        break;
      case 'monthly':
        this.filteredScholarships = this.scholarships.filter(
          (scholarship) => scholarship.datePosted >= monthAgo
        );
        break;
      default:
        this.filteredScholarships = [...this.scholarships];
    }

    // If no scholarships match the filter, show all for demo purposes
    if (this.filteredScholarships.length === 0) {
      this.filteredScholarships = [...this.scholarships];
    }
  }

  private initChart(): void {
    if (!this.pieChart?.nativeElement) return;

    const canvas = this.pieChart.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size
    const size = 280;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Chart data
    const data = [
      { value: 942, color: '#4f46e5', label: 'Marked as applied' },
      { value: 25, color: '#ff6b35', label: 'Total' },
      { value: 15, color: '#3b82f6', label: 'Approved' },
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2; // Start from top

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 90;
    const innerRadius = 50;

    // Draw donut chart
    data.forEach((item) => {
      const angle = (item.value / total) * 2 * Math.PI;

      // Draw arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + angle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      currentAngle += angle;
    });

    // Add percentage labels
    currentAngle = -Math.PI / 2;
    data.forEach((item, index) => {
      const angle = (item.value / total) * 2 * Math.PI;
      const midAngle = currentAngle + angle / 2;
      const labelRadius = (radius + innerRadius) / 2;

      const x = centerX + Math.cos(midAngle) * labelRadius;
      const y = centerY + Math.sin(midAngle) * labelRadius;

      const percentage = ((item.value / total) * 100).toFixed(1);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Add percentage sign logic
      const displayText =
        index === 0 ? `+${percentage}%` : index === 1 ? `+${percentage}%` : `-${percentage}%`;

      ctx.fillText(displayText, x, y);

      currentAngle += angle;
    });
  }

  downloadReport(): void {
    // Simulate report download
    console.log('Downloading report...');

    // In a real application, we will:
    // 1. Generate the report data
    // 2. Create a downloadable file (PDF, Excel, etc.)
    // 3. Trigger the download

    // For now, we'll show a simple notification
    alert('Report download started! Check your downloads folder.');
  }

  // Utility method to get trend icon
  getTrendIcon(trend: 'up' | 'down'): string {
    return trend === 'up' ? '↗' : '↘';
  }

  // Utility method to get trend class
  getTrendClass(trend: 'up' | 'down'): string {
    return trend === 'up' ? 'trend-up' : 'trend-down';
  }
}