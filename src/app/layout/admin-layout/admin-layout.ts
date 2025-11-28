import { Component } from '@angular/core';
import { AdminSidebar } from "../../shared/admin-sidebar/admin-sidebar";
import { AdminNav } from "../../shared/admin-nav/admin-nav";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-admin-layout',
  imports: [AdminSidebar, AdminNav, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  isSidebarCollapsed = false;
}
