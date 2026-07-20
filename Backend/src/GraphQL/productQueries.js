export const GET_PRODUCTS = `
query ProductsSearchSorted(
  $query: String!
  $first: Int
  $last: Int
  $after: String
  $before: String
  $sortKey: ProductSortKeys
  $reverse: Boolean
) {
  products(
    query: $query
    first: $first
    last: $last
    after: $after
    before: $before
    sortKey: $sortKey
    reverse: $reverse
  ) {
    edges {
      cursor

      node {
        id
        title
        descriptionHtml
        status
        productType
        vendor

        createdAt
        updatedAt

        totalInventory

        featuredImage {
          id
          url
          altText
        }

        images(first: 20) {
          edges {
            node {
              id
              url
              altText
              width
              height
            }
          }
        }

        variants(first: 100) {
          edges {
            node {
              id
              title
              sku
              barcode

              price
              compareAtPrice

              inventoryQuantity
              inventoryPolicy

              availableForSale

              taxable
              createdAt
              updatedAt
            }
          }
        }
      }
    }

    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`;

export const GET_PRODUCTS_TYPES = `
query getProductTypesForFilter(
  $first: Int!
  $after: String
) {
  productTypes(
    first: $first
    after: $after
  ) {
    edges {
      cursor
      node
    }

    pageInfo {
      hasNextPage
    }
  }
}
`;