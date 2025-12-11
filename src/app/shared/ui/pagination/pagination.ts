import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Reusable pagination component for dashboard tables and lists.
 * Provides page navigation, per-page selector, and range display.
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  /** Current page number (1-indexed) */
  @Input() page: number = 1;

  /** Number of items per page */
  @Input() perPage: number = 10;

  /** Total number of items */
  @Input() total: number = 0;

  /** Last page number */
  @Input() lastPage: number = 1;

  /** Options for per-page dropdown */
  @Input() perPageOptions: number[] = [10, 15, 25, 50];

  /** Whether to show the per-page selector */
  @Input() showPerPageSelector: boolean = true;

  /** Emitted when page changes */
  @Output() pageChange = new EventEmitter<number>();

  /** Emitted when per-page value changes */
  @Output() perPageChange = new EventEmitter<number>();

  /** Calculate the start of the displayed range */
  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.perPage + 1;
  }

  /** Calculate the end of the displayed range */
  get rangeEnd(): number {
    const end = this.page * this.perPage;
    return Math.min(end, this.total);
  }

  /** Navigate to a specific page */
  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.pageChange.emit(page);
  }

  /** Handle per-page selection change */
  onPerPageChange(value: number): void {
    this.perPageChange.emit(value);
  }
}
