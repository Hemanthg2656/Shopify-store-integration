export const GET_CUSTOMERS = `
query Customers(
  $query: String!
  $first: Int
  $last: Int
  $after: String
  $before: String
) {
  customers(
    query: $query
    first: $first
    last: $last
    after: $after
    before: $before
  ) {
    edges {
      cursor
      node {
        id
        firstName
        lastName
        email
        phone
        numberOfOrders

        amountSpent {
          amount
          currencyCode
        }

        createdAt
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