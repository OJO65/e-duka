import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail-skeleton.component.html',
  styleUrls: ['./product-detail-skeleton.component.css']
})
export class ProductDetailSkeletonComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
