import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-skeleton.component.html',
  styleUrls: ['./shop-skeleton.component.css']
})
export class ShopSkeletonComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
