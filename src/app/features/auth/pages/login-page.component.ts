import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { finalize } from "rxjs/operators";
import { AuthService } from "../../../core/auth/auth.service";

@Component({
  selector: "app-login-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="auth-page">
      <div class="auth-card">
        <h1>Sign in</h1>
        <p>
          Frontend mode is active. Use mock sign-in to continue building UI while
          backend integration is pending.
        </p>
        <button type="button" [disabled]="isLoading()" (click)="login()">
          {{ isLoading() ? "Signing in..." : "Continue with mock sign-in" }}
        </button>
        <p *ngIf="errorMessage()" class="error">{{ errorMessage() }}</p>
      </div>
    </section>
  `,
  styles: [
    `
      .auth-page {
        min-height: calc(100vh - 64px);
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .auth-card {
        width: min(460px, 100%);
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
        padding: 28px;
        display: grid;
        gap: 16px;
      }
      h1 {
        margin: 0;
        color: #0f172a;
      }
      p {
        margin: 0;
        color: #334155;
      }
      button {
        border: 0;
        border-radius: 10px;
        background: #1849ff;
        color: #fff;
        font-weight: 600;
        padding: 12px 14px;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  login(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService
      .loginWithMicrosoft()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          const redirectUrl = localStorage.getItem("redirectUrl") ?? "/dashboard";
          localStorage.removeItem("redirectUrl");
          this.router.navigateByUrl(redirectUrl);
        },
        error: () => {
          this.errorMessage.set("Sign-in failed. Please try again.");
        },
      });
  }
}
