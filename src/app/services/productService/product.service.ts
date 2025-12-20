import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
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
              availableForSale
              images(first: 1) {
                nodes {
                  url
                }
              }
              variants(first: 1) {
                nodes {
                  id
                  title
                  availableForSale
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      `,
      variables: { query },
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
                variants(first: 1) {
                  nodes {
                    id
                    title
                    availableForSale
                    priceV2 {
                      amount
                      currencyCode
                    }
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
      variables: { id: collectionId },
    });
  }

  getProductById(productId: string): Observable<any> {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          descriptionHtml
          vendor
          productType
          tags
          availableForSale
          options {
            id
            name
            values
          }
          variants(first: 10) {
            nodes {
              id
              title
              availableForSale
              quantityAvailable
              priceV2 {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                url
              }
            }
          }
          images(first: 10) {
            nodes {
              url
              altText
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
    `;

    return this.apollo.query({
      query: gql(query),
      variables: { id: productId },
    });
  }

  createShopifyCart(items: any[]): Observable<any> {
    const lines = items.map((item) => ({
      merchandiseId: item.variantId,
      quantity: item.quantity,
    }));

    const mutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            lines(first: 10) {
              nodes {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    return this.apollo.mutate({
      mutation: gql(mutation),
      variables: {
        input: {
          lines: lines,
        },
      },
    });
  }
}
