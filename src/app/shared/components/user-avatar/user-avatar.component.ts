import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { User } from "../../models/user.model";

type AvatarSize = "xsmall" | "small" | "medium" | "large";

@Component({
  selector: "app-user-avatar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-avatar" [ngClass]="sizeClass">
      <img *ngIf="user.avatar; else initialsTpl" [src]="user.avatar" [alt]="user.displayName" />
      <ng-template #initialsTpl>{{ initials }}</ng-template>
    </div>
  `,
  styles: [
    `
      .user-avatar {
        border-radius: 50%;
        background: #3b82f6;
        color: white;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        overflow: hidden;
      }
      .user-avatar.xsmall {
        width: 24px;
        height: 24px;
        font-size: 0.625rem;
      }
      .user-avatar.small {
        width: 32px;
        height: 32px;
        font-size: 0.75rem;
      }
      .user-avatar.medium {
        width: 40px;
        height: 40px;
        font-size: 0.875rem;
      }
      .user-avatar.large {
        width: 48px;
        height: 48px;
        font-size: 1rem;
      }
      .user-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `,
  ],
})
export class UserAvatarComponent {
  @Input({ required: true }) user!: User;
  @Input() size: AvatarSize = "medium";

  get initials(): string {
    const parts = this.user.displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return "?";
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

  get sizeClass(): AvatarSize {
    return this.size;
  }
}
