import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface NavItem {
  label: string;
  icon?: string;
  route?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
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

  /**
   * Toggles the sidebar collapse state
   */
  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  /**
   * Programmatically set the collapse state
   * @param collapsed - The desired collapse state
   */
  setCollapsed(collapsed: boolean): void {
    if (this.collapsed !== collapsed) {
      this.collapsed = collapsed;
      this.collapsedChange.emit(this.collapsed);
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
}
