import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common';
import { PostsService } from './posts/posts.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { style } from '@angular/animations';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule] // Include FormsModule here
})
export class MainComponent implements OnInit {
  currentuser: string = '';
  currentID: number = 0;
  currentEmail: string = '';
  currentPhone: string = '';
  currentZipcode: string = '';
  currentPassword: string = '';
  dob: string = '';
  fullname: string = '';

  users: any[] = [];
  user: any = {};

  posts: any[] = []; // the posts that will show in frontend
  allPosts: any[] = []; // all posts from backend used for filter/search
  searchText: string = '';
  filteredPosts: any[] = []; // the 10 post that show in website, used for pagination
  articlesPerPage: number = 10; // Number of articles per page
  currentPage: number = 1; // Current page

  followers: any[] = [];
  followersIds: number[] = [];
  followerPosts: { [userName: string]: any[] } = {}; // Dictionary to store follower posts by user name

  newArticleText: string = '';
  newArticleImage: File | null = null;

  profilePicture: string = '';

  statusHeadline: string = 'NULL';
  statusInput: string = ''; 
  private apiUrl = 'https://comp531finalwebproject-c7f61df603db.herokuapp.com';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private postsService: PostsService, private cdr: ChangeDetectorRef) {}


  getPaginatedPosts(): any[] {
    const startIndex = (this.currentPage - 1) * this.articlesPerPage;
    const endIndex = startIndex + this.articlesPerPage;
    return this.posts.slice().reverse().slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.filteredPosts = this.getPaginatedPosts();
  }


  ngOnInit(): void {

    this.http.get(`${this.apiUrl}/articles`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      this.posts = response.body.articles;
      this.filteredPosts = this.getPaginatedPosts();
    });


    this.http.get(`${this.apiUrl}/headline`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      this.statusHeadline = response.body.headline;
      this.currentuser = response.body.username;
    });

    this.http.get(`${this.apiUrl}/allarticles`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      this.allPosts = response.body.articles;
      console.log("allPost ", this.allPosts);
    });

    this.http.get(`${this.apiUrl}/avatar`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      this.profilePicture = response.body.avatar;
    });



    this.fetchFollowers();
  }

  filterArticles() {
    this.posts = this.allPosts.filter(post => {
      const author = post.author.toLowerCase();
      return (
        post.text.toLowerCase().includes(this.searchText.toLowerCase()) ||
        author.includes(this.searchText.toLowerCase())
      );
    });
    console.log("search: ", this.posts);
    this.filteredPosts = this.getPaginatedPosts();
    this.cdr.detectChanges();
  }

  editArticle(postId: number): void {
    const updatedText = prompt('Enter the new text for the article:'); // Prompt user for new article text
    if (!updatedText) {
      alert('No text entered. Article was not updated.');
      return;
    }
  
    this.http.put(`${this.apiUrl}/articles/${postId}`, { text: updatedText }, { withCredentials: true, observe: 'response' }).subscribe(
      (response: any) => {
        alert('Article updated successfully!');
        // Update the local posts list with the updated article data
        console.log(response.body.article);
        this.http.get(`${this.apiUrl}/articles`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
          this.posts = response.body.articles;
          this.filteredPosts = this.getPaginatedPosts();
        });
        this.cdr.detectChanges();
      },
      (error) => {
        alert(`Failed to update the article: ${error.error?.error || 'Unknown error'}`);
      }
    );
  }
  
  commentOnArticle(postId: number): void {
    const commentText = prompt('Enter your comment:'); // Prompt user for comment text
    if (!commentText) {
      alert('No comment entered.');
      return;
    }
  
    this.http.put(`${this.apiUrl}/articles/${postId}`, { text: commentText, commentId: '-1' }, { withCredentials: true, observe: 'response' }).subscribe(
      (response: any) => {
        alert('Comment added successfully!');
        console.log(response.body.article);
        // update the articles for frontend UI
        this.http.get(`${this.apiUrl}/articles`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
          this.posts = response.body.articles;
          this.filteredPosts = this.getPaginatedPosts();
        });
        this.cdr.detectChanges();
      },
      (error) => {
        alert(`Failed to add a comment: ${error.error?.error || 'Unknown error'}`);
      }
    );
  }

  editComment(postId: number, comment: any): void {
    // Enable edit mode and set the editedText to the current comment text
    comment.isEditing = true;
    comment.editedText = comment.text;
  }
  
  saveComment(postId: number, comment: any): void {
    if (!comment.editedText.trim()) {
      alert('Comment text cannot be empty.');
      return;
    }
  
    this.http.put(
      `${this.apiUrl}/articles/${postId}`, 
      { text: comment.editedText, commentId: comment.id }, 
      { withCredentials: true, observe: 'response' }
    ).subscribe(
      (response: any) => {
        alert('Comment updated successfully!');
  
        this.http.get(`${this.apiUrl}/articles`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
          this.posts = response.body.articles;
          this.filteredPosts = this.getPaginatedPosts();
        });
        this.cdr.detectChanges();
  
        comment.isEditing = false; // Exit edit mode
      },
      (error) => {
        alert(`Failed to update the comment: ${error.error?.error || 'Unknown error'}`);
      }
    );
  }
  
  

  
  fetchFollowers() {
    // Fetch the next 3 users for user ID 1
    // sidebar with 3 followed JSON placeholder users, each has name, picture, and headline (new registered users have 0 followed users)
    this.http.get(`${this.apiUrl}/following`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      const followNames: string[] = response.body.following;
      this.followers = [];
      // Loop through each username and fetch avatar and headline
      followNames.forEach(username => {
        // Fetch the avatar for the username
        this.http.get(`${this.apiUrl}/avatar/${username}`, { withCredentials: true, observe: 'response' }).subscribe((avatarResponse: any) => {
          const avatar = avatarResponse.body.avatar || 'https://example.com/default-avatar.jpg'; // Default avatar if not found

          // Fetch the headline for the username
          this.http.get(`${this.apiUrl}/headline/${username}`, { withCredentials: true, observe: 'response' }).subscribe((headlineResponse: any) => {
            const headline = headlineResponse.body.headline || 'No headline provided'; // Default headline if not found
        
            // Push the user's details to the followers array
            this.followers.push({
                username,
                avatar,
                headline,
            });

            // Trigger change detection if needed
            this.cdr.detectChanges();
          }, error => {
              console.error(`Error fetching headline for ${username}:`, error);
          });
        }, error => {
            console.error(`Error fetching avatar for ${username}:`, error);
        });
      });
    }, error => {
      console.error("Error fetching following list:", error);
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.http.put(`${this.apiUrl}/logout`, {}, { withCredentials: true, observe: 'response' }).subscribe(
      (response) => {
        console.log('Login successful:', response);
        alert('Logout Success');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Login failed', error);
        alert('Login failed');
      }
    );

    
  }

  updateStatusHeadline() {
    this.statusHeadline = this.statusInput;
    this.http.put(`${this.apiUrl}/headline`, {"headline": this.statusHeadline}, { withCredentials: true, observe: 'response' }).subscribe(
      (response) => {
        console.log('update success', response);
        alert('Update Success');
      },
      (error) => {
        console.error('Update failed', error);
        alert('Update failed');
      }
    );
    this.statusInput = ''; // Clear input field after updating
  }

  addArticle(contentDiv: HTMLElement) {
    const newArticleText = contentDiv.textContent?.trim(); // Get text from the editable div
    
    if (!newArticleText && !this.newArticleImage) {
      alert('Please enter some text or upload an image for your post.');
      return;
    }

    const formData = new FormData();

    if (newArticleText) formData.append('text', newArticleText);
    if (this.newArticleImage) formData.append('image', this.newArticleImage);
    
    this.http.post(`${this.apiUrl}/article`, formData, { withCredentials: true, observe: 'response' }).subscribe(
      (response: any) => {
        console.log('Post successful:', response);
        // Update the articles for UI
        this.posts = response.body.articles;
        this.filteredPosts = this.getPaginatedPosts();
        this.newArticleImage = null; // Reset image after posting
        contentDiv.textContent = ''; // Clear the input field
        alert('Post Successful');
        window.location.reload();
      },
      (error: any) => {
        console.error('Post failed:', error.error.error);
        alert('Failed to post: '+error.error.error);
      }
    );
    
  }

  cancelArticle(contentDiv: HTMLElement) {
    contentDiv.textContent = ''; // Clear the content of the editable div
  }

  onImageSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.newArticleImage = event.target.files[0];
    }
  }

  addFollower(name: string) {
    if (!name || name.trim() === ''){
      alert('Please provide a valid username to follow.');
      return;
    }
    this.http.put(`${this.apiUrl}/following/${name.trim()}`, {}, { withCredentials: true, observe: 'response' }).subscribe(
      (response: any) => {
        // Success: Update the list of followers in the frontend
        this.followers = response.body.following; // Assuming backend sends updated 'following' list
        this.fetchFollowers(); // Re-fetch the followers list to update the UI
        // Re-fetch the articles to update the UI
        alert(`Successfully followed ${name}.`);
        this.http.get(`${this.apiUrl}/articles`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
          this.posts = response.body.articles;
          this.filteredPosts = this.getPaginatedPosts();
        });
      },
      (error) => {
        // Error: Display the error message from the backend
        if (error.error && error.error.error) {
          alert(`Error: ${error.error.error}`);
        } else {
          alert('An unknown error occurred.');
        }
      }
    );
  }

  unfollow(index: number) {

    // Get the follower's name before removing from the followers list
    const userName = this.followers[index].username;
    console.log("follower name: ", this.followers);

    this.http.delete(`${this.apiUrl}/following/${userName}`, { withCredentials: true, observe: 'response' }).subscribe(
      (response: any) => {
        // Success: Update the list of followers in the frontend
        this.followers = response.body.following; // Assuming backend sends updated 'following' list
        this.fetchFollowers(); // Re-fetch the followers list to update the UI
        alert(`Unfollower ${userName} success.`);
        // Re-fetch the articles to update the UI
        this.http.get(`${this.apiUrl}/articles`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
          this.posts = response.body.articles;
          this.filteredPosts = this.getPaginatedPosts();
        });
      },
      (error) => {
        // Error: Display the error message from the backend
        if (error.error && error.error.error) {
          alert(`Error: ${error.error.error}`);
        } else {
          alert('An unknown error occurred.');
        }
      }
    );

    // Fetch posts for all users after unfollowing
    this.cdr.detectChanges();
  }
}

  