import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import {
  ScholarshipService,
  RecommendedScholarship,
} from '../../../core/services/scholarship.service';
import { UserScholarshipService } from '../../../core/services/user-scholarship.service';
import { Scholarship } from '../../../core/services/scholarship.service';
import { RecommendationExplanationService } from '../../../core/services/recommendation-explanation.service';
import { RecommendationExplanation } from '../../../core/services/recommendation-explanation.service';
interface ScholarshipUI {
  id: number;
  scholarshipId: number;
  title: string;
  provider: string;
  providerLogo?: string;
  status: 'active' | 'expired' | 'applied';
  tags?: string[];
  matchScore?: number;
  category: string;
  requiredDocuments?: string[];
  notes?: string;
  savedDate: Date;
  applicationUrl?: string;

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
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayout, ConfirmModal],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  // =========================
  // LAYOUT DATA
  // =========================
  studentName = 'Student';

  menu: NavItem[] = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
    { label: 'Logout', action: 'logout' },
  ];

  scholarships: RecommendedScholarship[] = [];
  selectedScholarship: ScholarshipUI | null = null;
  relatedScholarships: RecommendedScholarship[] = [];

  selectedScholarshipIds: Set<number> = new Set();

  isSelectionMode = false;

  // AI explanation state
  aiExplanation: RecommendationExplanation | null = null;
  loadingExplanation = false;
  explanationError = '';
  selectedMatchId: number | null = null;
  showImproveTips = false;

  // =========================
  // RECOMMENDED — SHOW MORE
  // =========================
  /** How many cards are visible before the user expands */
  initialDisplayCount = 3;

  /** Flips to true when the user clicks "Show More" */
  showAllRecommended = false;

  /**
   * Computed slice of the full recommendations array.
   * Returns the first `initialDisplayCount` items while collapsed,
   * or the entire array once expanded.
   */
  get visibleRecommendedScholarships(): RecommendedScholarship[] {
    return this.showAllRecommended
      ? this.recommendedScholarships
      : this.recommendedScholarships.slice(0, this.initialDisplayCount);
  }

  /** Toggles the expanded / collapsed state */
  toggleShowMore(): void {
    this.showAllRecommended = !this.showAllRecommended;
  }

  // =========================
  // DASHBOARD STATS
  // =========================
  stats = {
    activeScholarships: 0,
    applied: 0,
    bookmarked: 0,
    recommended: 0,
  };

  // =========================
  // DATA
  // =========================
  recommendedScholarships: RecommendedScholarship[] = [];

  loading = false;
  error = '';

  showLogoutModal = false;

  constructor(
    private scholarshipService: ScholarshipService,
    private userScholarshipService: UserScholarshipService,
    private router: Router,
    private authService: AuthService,
    private explanationService: RecommendationExplanationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // =========================
  // LOAD DASHBOARD DATA
  // =========================
  private loadDashboardData(): void {
    this.loading = true;

    this.error = '';
    forkJoin({
      activeScholarships: this.scholarshipService.getActiveScholarships(),
      applied: this.userScholarshipService.getAppliedScholarships(),
      bookmarked: this.userScholarshipService.getBookmarkedScholarships(),
      recommended: this.scholarshipService
        .getRecommendedScholarships()
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ activeScholarships, applied, bookmarked, recommended }) => {
        this.stats.activeScholarships = activeScholarships?.count ?? 0;
        this.stats.applied = applied?.data?.length ?? 0;
        this.stats.bookmarked = bookmarked?.data?.length ?? 0;

        this.recommendedScholarships = recommended;
        this.stats.recommended = recommended.length;
      },
      error: (err) => console.error('Dashboard error:', err),
    });
  }

  // =========================
  // TEMPLATE ACTIONS
  // =========================
  onApplyNow(): void {
    this.router.navigate(['/student/scholarships']);
  }

  onViewSaved(): void {
    this.router.navigate(['/student/bookmarked']);
  }

  onEditProfile(): void {
    this.router.navigate(['/student/profile']);
  }

  private mapScholarshipToUI(s: Scholarship): ScholarshipUI {
    return {
      id: s.scholarship_id,
      scholarshipId: s.scholarship_id,

      title: s.title,
      provider: s.organization_name,
      providerLogo: s.banner_url,

      status: new Date(s.deadline) < new Date() ? 'expired' : 'active',

      category: s.scholarship_type,
      country: s.country,
      level: s.education_level,
      fundingType: s.scholarship_type,
      fieldOfStudy: s.fields_of_study.join(', '),

      tags: s.fields_of_study,

      amount: s.benefits,
      deadline: s.deadline,

      description: s.description,
      eligibility: s.eligibility_criteria.split('\n'),
      fundingDetails: s.benefits,
      requirements: s.application_instructions.split('\n'),

      requiredDocuments: s.verification_docs,
      applicationUrl: s.application_link,

      savedDate: new Date(s.created_at),
      isSaved: false,
      matchScore: s.matchScore,
    };
  }

  openScholarshipDetails(rec: RecommendedScholarship, event?: Event): void {
    if (event) event.stopPropagation();

    // reset AI state (important!)
    this.aiExplanation = null;
    this.loadingExplanation = false;
    this.explanationError = '';
    this.showImproveTips = false;

    this.selectedMatchId = rec.match_id;

    this.scholarshipService.getScholarshipById(rec.scholarship_id.toString()).subscribe({
      next: (res) => {
        this.selectedScholarship = this.mapScholarshipToUI(res.data);
      },
      error: (err) => {
        console.error('Failed to load scholarship details', err);
      },
    });
  }

  closeScholarshipDetails(): void {
    this.selectedScholarship = null;
    document.body.style.overflow = 'auto';
  }

  onViewScholarship(s: any): void {
    if (this.isSelectionMode) {
      this.toggleScholarshipSelection(s.scholarshipId);
    } else {
      this.openScholarshipDetails(s);
    }
  }

  toggleSelectionMode(): void {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.selectedScholarshipIds.clear();
    }
  }

  toggleScholarshipSelection(scholarshipId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedScholarshipIds.has(scholarshipId)) {
      this.selectedScholarshipIds.delete(scholarshipId);
    } else {
      this.selectedScholarshipIds.add(scholarshipId);
    }
  }

  goToApplyPage(scholarshipId: number): void {
    this.router.navigate(['/student/apply', scholarshipId]);
  }

  onSidebarAction(item: NavItem) {
    if (item.action === 'logout') {
      this.showLogoutModal = true;
    }
  }

  loadModalExplanation(matchId: number): void {
    if (!matchId || this.loadingExplanation || this.aiExplanation) {
      return;
    }

    this.loadingExplanation = true;
    this.explanationError = '';

    this.explanationService.getExplanation(matchId).subscribe({
      next: (res) => {
        this.aiExplanation = res;
        this.loadingExplanation = false;
      },
      error: () => {
        this.explanationError = 'Failed to load AI explanation.';
        this.loadingExplanation = false;
      },
    });
  }

  toggleImproveTips(): void {
    this.showImproveTips = !this.showImproveTips;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  // =========================
  // HELPERS
  // =========================
  getDaysRemaining(deadline: string | Date): number {
    const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const diff = date.getTime() - Date.now();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }
}
