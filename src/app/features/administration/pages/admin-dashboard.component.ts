import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="admin">
      <h1>Administration</h1>
      <div class="cards">
        <article class="card">Incident Types</article>
        <article class="card">Workflows</article>
        <article class="card">SLA Rules</article>
      </div>
    </section>
  `,
  styles: [
    `
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      .card {
        background: #fff;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 16px;
        padding: 16px;
      }
    `,
  ],
})
export class AdminDashboardComponent {}
