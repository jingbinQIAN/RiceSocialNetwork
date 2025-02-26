import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('Validate Authentication', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Mock the Router
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Spy on window.alert to prevent actual alerts and allow assertions
    spyOn(window, 'alert').and.stub();

  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });


  it('should log in a previously registered user (not new users, login state should be set)', () => {
    const username = 'Bret';
    const password = 'Kulas Light';

    // Mock the HTTP response
    service.login(username, password);
    const mockUser = {
      id: 1,
      username: 'Bret',
      address: { street: 'Kulas Light', zipcode: '92998-3874' },
      email: 'Sincere@april.biz',
      phone: '1-770-736-8031 x56442',
      dob: 'MOCK DOB', 
      fullname: undefined
    };
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush([mockUser]);

    expect(service.isAuthenticated).toBeTrue(); // Set Login State
    expect(service.getAuthenticatedUser()).toEqual(mockUser);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/main'], {
      queryParams: {
        name: 'Bret',
        id: 1,
        email: 'Sincere@april.biz',
        phone: '1-770-736-8031 x56442',
        zipcode: '92998-3874',
        password: 'Kulas Light',
        dob: 'MOCK DOB', 
        fullname: undefined
      }
    });
  });

  it('should not log in an invalid user (error state should be set)', () => {
    const username = 'invalidUser';
    const password = 'wrongPassword';

    service.login(username, password);

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush([{ id: 1, username: 'Bret', address: { street: 'Kulas Light' }}]);

    expect(service.isAuthenticated).toBeFalse();
    expect(service.getAuthenticatedUser()).toBe(null);
    expect(window.alert).toHaveBeenCalledWith('Invalid credentials. Please try again.'); // Set Error State
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should log out a user (login state should be cleared)', () => {
    const username = 'Bret';
    const password = 'Kulas Light';
    const mockUser = { 
      id: 1,
      username: 'Bret',
      email: 'Sincere@april.biz',
      phone: '1-770-736-8031 x56442',
      address: { street: password, zipcode: '92998-3874' },
      name: 'Leanne Graham'
    };
    service.login(username, password);
    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    req.flush([mockUser]); // Return a list containing the mock user

    expect(service.isAuthenticated).toBe(true);
    
    // Now, log out the user
    service.logout();
    expect(service.isAuthenticated).toBe(false);
    expect(service.getAuthenticatedUser()).toBe(null);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
