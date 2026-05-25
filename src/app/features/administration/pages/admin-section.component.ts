import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";

type AdminSectionData = {
  title: string;
  subtitle: string;
  icon: string;
  summary: string[];
};

@Component({
  selector: "app-admin-section",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-section">
      <a class="admin-section__back" routerLink="/administration">
        <span class="material-icons">arrow_back</span>
        Back to administration
      </a>

      <div class="admin-section__hero">
        <div class="admin-section__icon">
          <span class="material-icons">{{ data.icon }}</span>
        </div>
        <div>
          <h1>{{ data.title }}</h1>
          <p>{{ data.subtitle }}</p>
        </div>
      </div>

      <div class="admin-section__panel">
        <h2>What you can do here</h2>
        <ul>
          @for (item of data.summary; track item) {
            <li>{{ item }}</li>
          }
        </ul>
      </div>

      <div class="admin-section__panel admin-section__panel--highlight">
        <h2>Suggested next step</h2>
        <p>
          Use the workflow configuration page to align department handoffs and
          keep board movements consistent.
        </p>
        <a class="admin-section__cta" routerLink="workflows">
          <span class="material-icons">account_tree</span>
          Open workflows
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-section {
        display: grid;
        gap: 18px;
      }

      .admin-section__back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #245bd1;
        font-weight: 700;
        text-decoration: none;
      }

      .admin-section__hero {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 18px 20px;
        border: 1px solid #dbe3ef;
        border-radius: 18px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      }

      .admin-section__icon {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #2f6fed, #245bd1);
        color: white;
      }

      .admin-section__hero h1 {
        margin: 0;
        font-size: 28px;
      }

      .admin-section__hero p {
        margin: 6px 0 0;
        color: #475569;
      }

      .admin-section__panel {
        padding: 18px 20px;
        border: 1px solid #dbe3ef;
        border-radius: 18px;
        background: white;
      }

      .admin-section__panel h2 {
        margin: 0 0 12px;
        font-size: 18px;
      }

      .admin-section__panel ul {
        margin: 0;
        padding-left: 18px;
        color: #334155;
        display: grid;
        gap: 8px;
      }

      .admin-section__panel--highlight {
        background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
      }

      .admin-section__cta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        background: #2f6fed;
        color: white;
        font-weight: 700;
        text-decoration: none;
      }

      @media (max-width: 720px) {
        .admin-section__hero {
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class AdminSectionComponent {
  private readonly route = inject(ActivatedRoute);

  readonly data = this.route.snapshot.data as AdminSectionData;
}
