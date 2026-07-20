export const GET_ORDERS = `
query Orders(
  $query: String!
  $first: Int
  $last: Int
  $after: String
  $before: String
  $sortKey: OrderSortKeys
  $reverse: Boolean
) {
  orders(
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
        name
        createdAt
        updatedAt
        
        displayFinancialStatus
        displayFulfillmentStatus

        currentTotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }

        customer {
          id
          firstName
          lastName
          email
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