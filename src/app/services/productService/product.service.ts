import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private apollo: Apollo) {}

  searchProducts(query: string): Observable<any> {
    return this.apollo.query({
      query: gql`
        query SearchProducts($query: String!) {
          products(first: 20, query: $query) {
            nodes {
              id
              title
              handle
              description
              images(first: 1) {
                nodes {
                  url
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                }
              }
            }
          }
        }
      `,
      variables: { query }
    });
  }

  getProductsByCollection(collectionId: string): Observable<any> {
    return this.apollo.query({
      query: gql`
        query GetCollectionProducts($id: ID!) {
          collection(id: $id) {
            id
            title
            description
            products(first: 100) {
              nodes {
                id
                title
                vendor
                tags
                availableForSale
                images(first: 1) {
                  nodes {
                    url
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      `,
      variables: { id: collectionId }
    });
  }
}
