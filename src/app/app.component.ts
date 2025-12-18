import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SearchService } from './services/searchService/search.service';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'e-duka';
  products: any[] = [];
  loading: boolean = false;
  showProducts: boolean = false;

  constructor(private searchService: SearchService) {}

  onSearch(query: string) {
    this.searchService.setSearch(query);
  }
}
