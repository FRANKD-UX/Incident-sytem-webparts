import { Injectable } from "@angular/core";
import { signal } from "@angular/core";

export type NotificationLevel = "success" | "error" | "info";

export interface NotificationMessage {
  id: string;
  level: NotificationLevel;
  text: string;
}

@Injectable({ providedIn: "root" })
export class NotificationService {
  private counter = 0;
  readonly messages = signal<NotificationMessage[]>([]);

  success(message: string): void {
    this.push("success", message);
  }
  error(message: string): void {
    this.push("error", message);
  }
  info(message: string): void {
    this.push("info", message);
  }

  dismiss(id: string): void {
    this.messages.update((messages) =>
      messages.filter((message) => message.id !== id),
    );
  }

  private push(level: NotificationLevel, text: string): void {
    const id = crypto.randomUUID?.() ?? `notification-${++this.counter}`;
    this.messages.update((messages) => [...messages, { id, level, text }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
