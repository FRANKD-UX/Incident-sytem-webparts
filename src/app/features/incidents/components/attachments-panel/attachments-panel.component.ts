// src/app/features/incidents/components/attachments-panel/attachments-panel.component.ts

import { Component, Input, Output, EventEmitter, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AttachmentApiService } from "../../../../api/attachment-api.service";
import {
  Attachment,
  AttachmentCategory,
} from "../../../../shared/models/attachment.model";
import { LoadingStateComponent } from "../../../../shared/components/loading-state/loading-state.component";
import { EmptyStateComponent } from "../../../../shared/components/empty-state/empty-state.component";
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-attachments-panel",
  standalone: true,
  imports: [
    CommonModule,
    LoadingStateComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent,
  ],
  template: `
    <div class="attachments-panel">
      <div class="panel-header">
        <h3>Attachments</h3>
        <div class="upload-area">
          <input
            type="file"
            #fileInput
            multiple
            (change)="onFilesSelected($event)"
            style="display: none"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.csv"
          />
          <button class="btn btn-primary" (click)="fileInput.click()">
            <span class="material-icons">upload</span>
            Upload Files
          </button>
        </div>
      </div>

      @if (uploading) {
        <div class="upload-progress">
          <span class="material-icons spinning">sync</span>
          <span>Uploading files...</span>
        </div>
      }

      @if (loading) {
        <app-loading-state message="Loading attachments..." />
      } @else if (attachments.length === 0) {
        <app-empty-state
          icon="attach_file"
          title="No attachments"
          description="Upload files, screenshots, or documents as evidence"
        />
      } @else {
        <div class="attachments-list">
          <!-- Proof of Uptime Section -->
          @if (hasProofOfUptime) {
            <div class="attachment-section">
              <h4 class="section-title">
                <span class="material-icons">verified</span>
                Proof of Uptime
              </h4>
              @for (attachment of proofOfUptimeFiles; track attachment.id) {
                <div class="attachment-item proof">
                  <div class="attachment-icon">
                    <span class="material-icons">verified</span>
                  </div>
                  <div class="attachment-info">
                    <span class="attachment-name">{{
                      attachment.fileName
                    }}</span>
                    <span class="attachment-meta">
                      Uploaded {{ attachment.uploadedAt | date: "medium" }}
                    </span>
                  </div>
                  <div class="attachment-actions">
                    <button
                      class="btn-icon"
                      (click)="downloadAttachment(attachment)"
                    >
                      <span class="material-icons">download</span>
                    </button>
                    <button
                      class="btn-icon"
                      (click)="deleteAttachment(attachment)"
                    >
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Other Attachments -->
          <div class="attachment-section">
            <h4 class="section-title">
              <span class="material-icons">folder</span>
              All Files
            </h4>
            @for (attachment of otherAttachments; track attachment.id) {
              <div class="attachment-item">
                <div
                  class="attachment-icon"
                  [class]="getFileTypeClass(attachment.fileType)"
                >
                  <span class="material-icons">{{
                    getFileIcon(attachment.fileType)
                  }}</span>
                </div>
                <div class="attachment-info">
                  <span class="attachment-name">{{ attachment.fileName }}</span>
                  <div class="attachment-meta">
                    <span>{{ formatFileSize(attachment.fileSize) }}</span>
                    <span>{{ attachment.category }}</span>
                    <span>{{ attachment.uploadedAt | date: "medium" }}</span>
                  </div>
                </div>
                <div class="attachment-actions">
                  @if (canMarkAsProof && !attachment.isProofOfUptime) {
                    <button
                      class="btn btn-secondary btn-xs"
                      (click)="markAsProof(attachment)"
                    >
                      Mark as Proof
                    </button>
                  }
                  <button
                    class="btn-icon"
                    (click)="downloadAttachment(attachment)"
                  >
                    <span class="material-icons">download</span>
                  </button>
                  <button
                    class="btn-icon"
                    (click)="deleteAttachment(attachment)"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Delete Confirmation -->
      @if (deleteTarget) {
        <app-confirmation-dialog
          title="Delete Attachment"
          [message]="
            'Are you sure you want to delete ' + deleteTarget.fileName + '?'
          "
          confirmLabel="Delete"
          (confirm)="confirmDelete()"
          (cancel)="deleteTarget = null"
        />
      }
    </div>
  `,
  styleUrls: ["./attachments-panel.component.scss"],
})
export class AttachmentsPanelComponent {
  @Input({ required: true }) incidentId!: string;
  @Input() attachments: Attachment[] = [];
  @Input() canMarkAsProof = true;
  @Output() attachmentsUpdated = new EventEmitter<void>();

  private readonly attachmentApi = inject(AttachmentApiService);

  loading = false;
  uploading = false;
  deleteTarget: Attachment | null = null;

  get proofOfUptimeFiles(): Attachment[] {
    return this.attachments.filter((a) => a.isProofOfUptime);
  }

  get otherAttachments(): Attachment[] {
    return this.attachments.filter((a) => !a.isProofOfUptime);
  }

  get hasProofOfUptime(): boolean {
    return this.proofOfUptimeFiles.length > 0;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.uploadFiles(Array.from(input.files));
    }
  }

  private uploadFiles(files: File[]): void {
    this.uploading = true;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("incidentId", this.incidentId);

    this.attachmentApi.uploadAttachments(this.incidentId, formData).subscribe({
      next: () => {
        this.uploading = false;
        this.attachmentsUpdated.emit();
      },
      error: (err) => {
        this.uploading = false;
        console.error("Upload failed:", err);
      },
    });
  }

  downloadAttachment(attachment: Attachment): void {
    window.open(attachment.url, "_blank");
  }

  deleteAttachment(attachment: Attachment): void {
    this.deleteTarget = attachment;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;

    this.attachmentApi
      .deleteAttachment(this.incidentId, this.deleteTarget.id)
      .subscribe({
        next: () => {
          this.deleteTarget = null;
          this.attachmentsUpdated.emit();
        },
        error: (err) => {
          console.error("Delete failed:", err);
          this.deleteTarget = null;
        },
      });
  }

  markAsProof(attachment: Attachment): void {
    this.attachmentApi
      .updateAttachment(this.incidentId, attachment.id, {
        isProofOfUptime: true,
      })
      .subscribe({
        next: () => {
          this.attachmentsUpdated.emit();
        },
        error: (err) => console.error("Failed to mark as proof:", err),
      });
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes("pdf")) return "picture_as_pdf";
    if (fileType.includes("image")) return "image";
    if (fileType.includes("word") || fileType.includes("document"))
      return "description";
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return "table_chart";
    return "insert_drive_file";
  }

  getFileTypeClass(fileType: string): string {
    if (fileType.includes("pdf")) return "file-pdf";
    if (fileType.includes("image")) return "file-image";
    if (fileType.includes("word")) return "file-doc";
    return "file-other";
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
}
