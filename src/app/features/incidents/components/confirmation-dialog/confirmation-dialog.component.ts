import { Component, Input, Output, EventEmitter } from "@angular/core";
@Component({
  selector: "app-confirmation-dialog",
  standalone: true,
  template: ` <div class="modal-overlay">
    <div class="modal">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button (click)="confirm.emit()">{{ confirmLabel }}</button>
      <button (click)="cancel.emit()">{{ cancelLabel }}</button>
    </div>
  </div>`,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .modal {
        background: white;
        padding: 24px;
        border-radius: 8px;
      }
    `,
  ],
})
export class ConfirmationDialogComponent {
  @Input() title = "Confirm";
  @Input() message = "Are you sure?";
  @Input() confirmLabel = "Confirm";
  @Input() cancelLabel = "Cancel";
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
