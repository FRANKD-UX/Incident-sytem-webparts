import { TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { roleGuard } from "./role.guard";
import { AuthService } from "./auth.service";

describe("roleGuard", () => {
  const routerSpy = jasmine.createSpyObj<Router>("Router", ["navigate"]);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
  });

  it("blocks unauthenticated users", () => {
    const auth = TestBed.inject(AuthService);
    auth.logout();

    const route = {
      data: { permissions: ["VIEW_BOARD"] },
    } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/login"]);
  });

  it("allows user with required permission", () => {
    const auth = TestBed.inject(AuthService);
    auth.setMockUser("AGENT");

    const route = {
      data: { permissions: ["VIEW_BOARD"] },
    } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBeTrue();
  });

  it("denies when permission is missing", () => {
    const auth = TestBed.inject(AuthService);
    auth.setMockUser("AGENT");

    const route = {
      data: { permissions: ["MANAGE_USERS"] },
    } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/unauthorized"]);
  });
});
