import { PostsService } from './posts.service';
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent {
  articles: any[] = [];
  filteredArticles: any[] = [];
  searchText: string = '';

  constructor(private PostsService: PostsService) {}

}
