/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WishlistService } from './wishlist.service';

describe('Service: Wishlist', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WishlistService]
    });
  });

  it('should ...', inject([WishlistService], (service: WishlistService) => {
    expect(service).toBeTruthy();
  }));
});
