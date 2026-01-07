import { Component, Input, OnInit, OnDestroy, HostListener, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar, NavItem } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout implements OnInit, OnDestroy {
  @ViewChild(Sidebar) sidebar!: Sidebar;

  @Input() title = '';
  @Input() menu: NavItem[] = [];
  @Input() logoUrl = '';
  @Input() logoIconUrl = '';
  @Input() logoText = '';
  @Input() logoAlt = '';
  @Output() action = new EventEmitter<any>();

  // State management
  public collapsed = false;
  public mobileMenuOpen = false;
  public isMobile = false;
  private resizeTimeout?: number;
  public isDarkMode = false;

  ngOnInit(): void {
    this.checkMobileState();
    this.loadSidebarPreferences();
    this.loadThemePreference();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('dashboard-theme', this.isDarkMode ? 'dark' : 'light');

    const host = document.querySelector('body');
    if (host) {
      if (this.isDarkMode) {
        host.classList.add('dark-mode');
      } else {
        host.classList.remove('dark-mode');
      }
    }
  }

  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  ngOnDestroy(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = window.setTimeout(() => {
      const wasMobile = this.isMobile;
      this.checkMobileState();

      // Handle transition between mobile and desktop
      if (wasMobile !== this.isMobile) {
        this.handleViewportChange();
      }
    }, 150);
  }

  /**
   * Check if we're in mobile viewport
   */
  private checkMobileState(): void {
    this.isMobile = window.innerWidth <= 1024;
  }

  /**
   * Handle changes between mobile and desktop viewports
   */
  private handleViewportChange(): void {
    if (this.isMobile) {
      // Switching to mobile - close mobile menu if open
      if (this.mobileMenuOpen) {
        this.mobileMenuOpen = false;
      }
    } else {
      // Switching to desktop - ensure mobile menu is closed
      this.mobileMenuOpen = false;
    }
  }

  /**
   * Handle sidebar collapse changes (desktop only)
   */
  onSidebarCollapsedChange(collapsed: boolean): void {
    this.collapsed = collapsed;
    this.saveSidebarPreferences();
  }

  /**
   * Handle mobile menu toggle
   */
  onMobileMenuToggle(open: boolean): void {
    this.mobileMenuOpen = open;
  }

  /**
   * Toggle mobile menu from header button
   */
  toggleMobileMenu(): void {
    if (this.sidebar) {
      this.sidebar.toggleMobileMenu();
    }
  }

  /**
   * Get CSS classes for main area
   */
  getMainAreaClasses(): { [key: string]: boolean } {
    return {
      'sidebar-collapsed': this.collapsed && !this.isMobile,
      mobile: this.isMobile,
      'mobile-menu-open': this.mobileMenuOpen && this.isMobile,
    };
  }

  /**
   * Save sidebar preferences to localStorage
   */
  private saveSidebarPreferences(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('dashboard-sidebar-collapsed', JSON.stringify(this.collapsed));
      } catch (error) {
        console.warn('Failed to save sidebar preferences:', error);
      }
    }
  }

  /**
   * Load sidebar preferences from localStorage
   */
  private loadSidebarPreferences(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('dashboard-sidebar-collapsed');
        if (saved !== null) {
          this.collapsed = JSON.parse(saved);
        }
      } catch (error) {
        console.warn('Failed to load sidebar preferences:', error);
        this.collapsed = false;
      }
    }
  }

  /**
   * Toggle sidebar programmatically
   */
  toggleSidebar(): void {
    if (this.isMobile) {
      this.toggleMobileMenu();
    } else if (this.sidebar) {
      this.sidebar.toggleCollapse();
    }
  }

  /**
   * Close mobile menu programmatically
   */
  closeMobileMenu(): void {
    if (this.isMobile && this.mobileMenuOpen && this.sidebar) {
      this.sidebar.closeMobileMenu();
    }
  }

  /**
   * Get current layout state for debugging or external components
   */
  getLayoutState(): {
    isMobile: boolean;
    collapsed: boolean;
    mobileMenuOpen: boolean;
    sidebarWidth: number;
  } {
    return {
      isMobile: this.isMobile,
      collapsed: this.collapsed,
      mobileMenuOpen: this.mobileMenuOpen,
      sidebarWidth: this.getSidebarWidth(),
    };
  }

  /**
   * Get current sidebar width for calculations
   */
  private getSidebarWidth(): number {
    if (this.isMobile) {
      return 0;
    }
    return this.collapsed ? 72 : 250;
  }

  /**
   * Check if sidebar should show collapse button
   */
  shouldShowCollapseButton(): boolean {
    return !this.isMobile;
  }

  /**
   * Check if we should show mobile menu trigger
   */
  shouldShowMobileMenuTrigger(): boolean {
    return this.isMobile;
  }

  onSidebarAction(item: any) {
     console.log('Layout received action:', item)
    this.action.emit(item);
  }
}
