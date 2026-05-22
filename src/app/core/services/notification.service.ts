import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class NotificationService {
  success(message: string): void {
    console.log("[success]", message);
  }
  error(message: string): void {
    console.error("[error]", message);
  }
  info(message: string): void {
    console.info("[info]", message);
  }
}
