import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('Validate Profile actions', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ name: 'Leanne Graham', id: 1, email: "Sincere@april.biz", phone: "1-770-746-8031", zipcode: "92998-3874", password: "Kulas Light"}) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Run ngOnInit and bind query parameters
  });

  it('should fetch the logged in user\'s username from query parameters (retrieve username from login state after logging in)', () => {
    expect(component.currentuser).toBe('Leanne Graham');
  });


  
});
