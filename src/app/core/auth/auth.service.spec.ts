import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it("starts unauthenticated", () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });

  it("logs in with mock microsoft flow and sets session", fakeAsync(() => {
    let emittedUserId = "";

    service.loginWithMicrosoft().subscribe((user) => {
      emittedUserId = user.id;
    });

    tick(121);

    expect(emittedUserId).toBeTruthy();
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getToken()).toContain("mock-token");
    expect(service.getPermissions().allowedActions.length).toBeGreaterThan(0);
  }));

  it("clears session on logout", fakeAsync(() => {
    service.loginWithMicrosoft().subscribe();
    tick(121);

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getToken()).toBeNull();
    expect(service.getPermissions().allowedActions).toEqual([]);
  }));
});
