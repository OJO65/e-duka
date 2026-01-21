import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/authService/auth.service';
import { of } from 'rxjs';

describe('AuthGuard (full-proof)', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow navigation when isLoggedIn() returns true (sync)', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    const result = guard.canActivate();
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should block navigation and redirect when isLoggedIn() returns false (sync)', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);

    const result = guard.canActivate();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow navigation when isLoggedIn() returns Promise<true> (async)', async () => {
    authServiceSpy.isLoggedIn.and.returnValue(Promise.resolve(true) as any);

    const result = await guard.canActivate();
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should block navigation and redirect when isLoggedIn() returns Promise<false> (async)', async () => {
    authServiceSpy.isLoggedIn.and.returnValue(Promise.resolve(false) as any);

    const result = await guard.canActivate();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow navigation when isLoggedIn() returns Observable<true> (reactive)', (done) => {
    authServiceSpy.isLoggedIn.and.returnValue(of(true) as any);

    const result: any = guard.canActivate();
    if ((result as any) instanceof Promise) {
      result.then((res: boolean) => {
        expect(res).toBeTrue();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    } else {
      result.subscribe((res: boolean) => {
        expect(res).toBeTrue();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    }
  });

  it('should block navigation and redirect when isLoggedIn() returns Observable<false> (reactive)', (done) => {
    authServiceSpy.isLoggedIn.and.returnValue(of(false) as any);

    const result: any = guard.canActivate();
    if (result instanceof Promise) {
      result.then((res) => {
        expect(res).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        done();
      });
    } else {
      result.subscribe((res: boolean) => {
        expect(res).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        done();
      });
    }
  });
});
