import { Component } from "@angular/core";

@Component({
  selector: "app-top-bar",
  standalone: true,
  template: `
    <header class="top-bar">
      <div class="brand">
        <span class="mark">IO</span><span>IncidentOps</span>
      </div>
      <div class="search">Incident workflow platform</div>
      <div class="user">Frank Ndlovu</div>
    </header>
  `,
  styles: [
    `
      .top-bar {
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        background: linear-gradient(135deg, #081226, #0f1f43);
        color: #fff;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 800;
      }
      .mark {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: #1849ff;
      }
      .search {
        opacity: 0.8;
      }
    `,
  ],
})
export class TopBarComponent {}
