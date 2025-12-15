import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private apollo: Apollo) {}

  getCollections() {
    return this.apollo.query({
      query: gql`
        query GetCollections {
          collections(first: 10) {
            nodes {
              id
              title
              handle
              image {
                url
              }
            }
          }
        }
      `,
    });
  }
}
