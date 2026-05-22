import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-unauthorized-page",
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="state-page">
      <div class="state-card">
        <h1>Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
        <a routerLink="/dashboard">Back to dashboard</a>
      </div>
    </section>
  `,
  styles: [
    `
      .state-page {
        min-height: calc(100vh - 64px);
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .state-card {
        width: min(460px, 100%);
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
        padding: 28px;
        display: grid;
        gap: 12px;
      }
      h1,
      p {
        margin: 0;
      }
      a {
        color: #1849ff;
        font-weight: 600;
        text-decoration: none;
      }
    `,
  ],
})
export class UnauthorizedPageComponent {}
