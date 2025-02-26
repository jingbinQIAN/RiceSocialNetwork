import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { PostsService } from './posts/posts.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Validate Article actions', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let httpMock: HttpTestingController;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const postsServiceMock = jasmine.createSpyObj('PostsService', ['getAllPosts', 'getPostsByUserId']);

    await TestBed.configureTestingModule({
      imports: [MainComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: PostsService, useValue: postsServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ name: 'TestUser', id: 1 }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    postsServiceSpy = TestBed.inject(PostsService) as jasmine.SpyObj<PostsService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock data for testing
    postsServiceSpy.getAllPosts.and.returnValue(of([
      { userId: 1, id: 1, title: 'Test Title 1', body: 'Test Body 1', timestamp: new Date(), authorName: 'TestUser' },
      { userId: 1, id: 2, title: 'Another Test Title', body: 'Another Test Body', timestamp: new Date(), authorName: 'TestUser' },
      { userId: 2, id: 3, title: 'Other User Post', body: 'Other Test Body', timestamp: new Date(), authorName: 'OtherUser' },
    ]));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all articles for the current logged in user (posts state is set)', () => {
    component.ngOnInit();

    // Simulate the response for the users and posts HTTP requests
    const userReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    userReq.flush([{
      id: 1,
      name: "Leanne Graham",
      username: 'Bret',
      address: { street: 'Kulas Light', zipcode: '92998-3874' },
      email: 'Sincere@april.biz',
      phone: '1-770-736-8031 x56442',
      company: { catchPhrase: "Multi-layered client-server neural-net" }
    }]);

    // Fetch posts after user data is loaded
    expect(postsServiceSpy.getAllPosts).toHaveBeenCalled();

    // Check if posts are correctly filtered by current user
    component.fetchPostsForUser(1);
    expect(component.posts.length).toBe(2); // Expect only the posts for userId 1
    expect(component.posts[0].title).toBe('Test Title 1');

    // This is for flush the request in fetchfollower function so as to avoid mistake when verifying the httpMock
    const followersReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    followersReq.flush([
      { id: 2, name: "Ervin Howell" },
      { id: 3, name: "Clementine Bauch" },
      { id: 4, name: "Patricia Lebsack" }
    ]);
  });

  it('should fetch subset of articles for current logged in user given search keyword (posts state is filtered)', () => {
    component.ngOnInit();

    // Simulate the response for the users and posts HTTP requests
    const userReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    userReq.flush([{
      id: 1,
      name: "Leanne Graham",
      username: 'Bret',
      address: { street: 'Kulas Light', zipcode: '92998-3874' },
      email: 'Sincere@april.biz',
      phone: '1-770-736-8031 x56442',
      company: { catchPhrase: "Multi-layered client-server neural-net" }
    }]);

    

    // Mock posts data that will be filtered
    component.allPosts = [
      {
        userId: 1, 
        id: 1, 
        title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit', 
        body: 'quia et suscipit\nsuscipit recusandae consequuntur …strum rerum est autem sunt rem eveniet architecto'
      }
    ];

    
    // Simulate a search
    component.searchText = 'sunt'; // Set the search text
    
    component.filterArticles(); // Call the filter function
    

    // Verify the filtering results
    expect(component.filteredPosts.length).toBe(1); // Expect one post to match 'sunt'
    expect(component.filteredPosts[0].title).toBe('sunt aut facere repellat provident occaecati excepturi optio reprehenderit');


    // This is for flush the request in fetchfollower function so as to avoid mistake when verifying the httpMock
    const followersReq = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    followersReq.flush([
      { id: 2, name: "Ervin Howell" },
      { id: 3, name: "Clementine Bauch" },
      { id: 4, name: "Patricia Lebsack" }
    ]);
  });

  it('should add articles when adding a follower (posts state is larger)', () => {
    // Arrange: Initial state with 2 posts
    component.posts = [
      { userId: 1, id: 1, title: 'Post 1', body: 'Body 1', timestamp: new Date(), name: 'User 1' },
      { userId: 1, id: 2, title: 'Post 2', body: 'Body 2', timestamp: new Date(), name: 'User 1' }
    ];

    component.users = [
      { id: 1, name: 'User 1', company: { catchPhrase: 'User 1 Company' } },
      { id: 2, name: 'User 2', company: { catchPhrase: 'User 2 Company' } }
    ];
    

    const initialPostCount = component.posts.length;
    
    // Mocking new follower data
    const followerPosts = [
      { userId: 2, id: 1, title: 'Post from User 2', body: 'Body from User 2', timestamp: new Date(), name: 'User 2' }
    ];


    postsServiceSpy.getPostsByUserId.and.returnValue(of(followerPosts));
  
    // Act: Add the new follower
    component.addFollower('User 2');

    // Trigger change detection
    fixture.detectChanges();
    httpMock.expectOne('https://jsonplaceholder.typicode.com/users'); // just to avoid the caputure url request mistake

    // After adding a follower, expect posts count to be larger
    expect(component.posts.length).toBeGreaterThan(initialPostCount)
    // Verify that the follower's posts are added
    expect(component.posts[0].name).toBe('User 2');
    expect(component.posts[0].title).toBe('Post from User 2');


  });  


  it('should remove articles when removing a follower (posts state is smaller)', () => {
    // Arrange: Initial state with 4 posts (2 posts from the user, 2 from followers)
    component.posts = [
      { userId: 1, id: 1, title: 'Test Title 1', body: 'Test Body 1', timestamp: new Date(), authorName: 'TestUser' },
      { userId: 1, id: 2, title: 'Another Test Title', body: 'Another Test Body', timestamp: new Date(), authorName: 'TestUser' },
      { userId: 2, id: 3, title: 'Follower Post 1', body: 'Content from follower', timestamp: new Date(), authorName: 'FollowerUser' },
      { userId: 2, id: 4, title: 'Follower Post 2', body: 'More content from follower', timestamp: new Date(), authorName: 'FollowerUser' },
    ];
    component.followers = [
      { id: 2, name: 'FollowerUser', image: '', width: '100px', headline: 'Follower Headline' },
    ];
  
    // Act: Remove the follower
    component.unfollow(0);  // Remove the first follower (index 0)
  
    // Assert: Check that posts have decreased by 2 (follower's posts)
    expect(component.posts.length).toBe(2);  // 2 posts from the user left
    expect(component.posts[0].title).toBe('Test Title 1');
    expect(component.posts[0].body).toBe('Test Body 1');
    expect(component.posts[1].title).toBe('Another Test Title');
    expect(component.posts[1].body).toBe('Another Test Body');
  });
  
});
