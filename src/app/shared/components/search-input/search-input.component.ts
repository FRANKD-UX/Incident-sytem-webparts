import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: "app-search-input",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="search-input-wrapper">
      <span class="material-icons">search</span>
      <input
        type="text"
        [value]="currentValue"
        [placeholder]="placeholder"
        (input)="onInput($event)"
      />
      <button *ngIf="currentValue" type="button" (click)="clear()">
        <span class="material-icons">close</span>
      </button>
    </div>
  `,
  styles: [
    `
      .search-input-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--border-color, #d1d5db);
        border-radius: 8px;
        padding: 8px 12px;
        background: var(--bg-primary, #ffffff);
      }
      .search-input-wrapper input {
        flex: 1;
        border: 0;
        outline: none;
        font: inherit;
        background: transparent;
      }
      .search-input-wrapper button {
        border: 0;
        background: transparent;
        display: inline-flex;
        cursor: pointer;
        padding: 0;
      }
      .material-icons {
        color: #6b7280;
        font-size: 1.125rem;
      }
    `,
  ],
})
export class SearchInputComponent implements OnInit, OnDestroy, OnChanges {
  @Input() value = "";
  @Input() placeholder = "Search...";
  @Output() search = new EventEmitter<string>();

  currentValue = "";

  private readonly searchSubject = new Subject<string>();
  private subscription = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    if ("value" in changes) {
      this.currentValue = this.value;
    }
  }

  ngOnInit(): void {
    this.currentValue = this.value;
    this.subscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => this.search.emit(query));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentValue = input.value;
    this.searchSubject.next(this.currentValue);
  }

  clear(): void {
    this.currentValue = "";
    this.searchSubject.next("");
  }
}
