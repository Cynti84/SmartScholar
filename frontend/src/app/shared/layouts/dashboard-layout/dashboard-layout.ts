import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar, NavItem } from '../../components/sidebar/sidebar';
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout {
  @Input() title = '';
  @Input() menu: NavItem[] = [];
  @Input() logoUrl = '';
  @Input() logoIconUrl = '';
  @Input() logoText = '';
  @Input() logoAlt = '';

  collapsed = false;
}
