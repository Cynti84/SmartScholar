import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface NavItem {
  label: string;
  icon?: string;
  route?: string;
  children?: NavItem[];
  action?: string
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit, OnDestroy {
  @Input() items: NavItem[] = [];
  @Input() collapsed = false;

  // Logo configuration inputs
  @Input() logoUrl?: string;
  @Input() logoIconUrl?: string; // Smaller icon version for collapsed state
  @Input() logoText?: string;
  @Input() logoAlt?: string;
  @Input() showNavigationTitle = true; // Whether to show "Navigation" header

  // Output event to notify parent components when collapse state changes
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() mobileMenuToggle = new EventEmitter<boolean>();

  // Mobile state management
  public mobileMenuOpen = false;
  public isMobile = false;
  private resizeTimeout?: number;

  ngOnInit(): void {
    this.checkMobileState();
    this.setupBodyScrollLock();
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
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
      const wasMotBile = this.isMobile;
      this.checkMobileState();

      // Close mobile menu if switching to desktop
      if (wasMotBile && !this.isMobile && this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    }, 150);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  /**
   * Check if we're in mobile viewport
   */
  private checkMobileState(): void {
    this.isMobile = window.innerWidth <= 1024;
  }

  /**
   * Toggles the sidebar collapse state (desktop only)
   */
  toggleCollapse(): void {
    if (!this.isMobile) {
      this.collapsed = !this.collapsed;
      this.collapsedChange.emit(this.collapsed);
    }
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.mobileMenuToggle.emit(this.mobileMenuOpen);

    if (this.mobileMenuOpen) {
      this.lockBodyScroll();
    } else {
      this.unlockBodyScroll();
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    if (this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
      this.mobileMenuToggle.emit(false);
      this.unlockBodyScroll();
    }
  }

  /**
   * Handle clicks on the sidebar container
   */
  onSidebarClick(event: Event): void {
    // Don't close menu when clicking inside the sidebar content
    event.stopPropagation();
  }

  /**
   * Handle navigation item clicks
   */
  onNavItemClick(item: NavItem): void {
    // Close mobile menu when navigating (if no children)
    if (this.isMobile && !item.children?.length && item.route) {
      this.closeMobileMenu();
    }
  }

  /**
   * Handle sub-item clicks
   */
  onSubItemClick(item: NavItem): void {
    // Always close mobile menu when clicking sub-items
    if (this.isMobile) {
      this.closeMobileMenu();
    }
  }

  /**
   * Programmatically set the collapse state (desktop only)
   * @param collapsed - The desired collapse state
   */
  setCollapsed(collapsed: boolean): void {
    if (!this.isMobile && this.collapsed !== collapsed) {
      this.collapsed = collapsed;
      this.collapsedChange.emit(this.collapsed);
    }
  }

  /**
   * Programmatically set mobile menu state
   * @param open - The desired mobile menu state
   */
  setMobileMenuOpen(open: boolean): void {
    if (this.mobileMenuOpen !== open) {
      this.mobileMenuOpen = open;
      this.mobileMenuToggle.emit(open);

      if (open) {
        this.lockBodyScroll();
      } else {
        this.unlockBodyScroll();
      }
    }
  }

  /**
   * Check if a nav item has children
   * @param item - The navigation item to check
   * @returns boolean indicating if the item has children
   */
  hasChildren(item: NavItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  /**
   * Lock body scroll when mobile menu is open
   */
  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  /**
   * Unlock body scroll when mobile menu is closed
   */
  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
  }

  /**
   * Setup body scroll lock management
   */
  private setupBodyScrollLock(): void {
    // Listen for clicks outside the sidebar on mobile
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        if (this.mobileMenuOpen && this.isMobile) {
          const sidebar = document.querySelector('.sidebar');
          const mobileButton = document.querySelector('.mobile-menu-button');

          if (
            sidebar &&
            !sidebar.contains(event.target as Node) &&
            mobileButton &&
            !mobileButton.contains(event.target as Node)
          ) {
            this.closeMobileMenu();
          }
        }
      });
    }
  }

  /**
   * Get current sidebar width for layout calculations
   */
  getSidebarWidth(): number {
    if (this.isMobile) {
      return 0; // Mobile sidebar doesn't affect layout
    }
    return this.collapsed ? 72 : 250;
  }

  /**
   * Check if sidebar is currently open (for mobile) or visible (for desktop)
   */
  isOpen(): boolean {
    return this.isMobile ? this.mobileMenuOpen : true;
  }

  @Output() action = new EventEmitter<any>();

  onActionClick(item: any): void {
    // console.log('Sidebar action: ', item)
    this.action.emit(item);
    this.closeMobileMenu();
  }
}
