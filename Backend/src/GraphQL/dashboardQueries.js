export const GET_DASHBOARD = `
query Dashboard {

  productsCount {
    count
  }

  ordersCount {
    count
  }

  customersCount {
    count
  }

  orders(
    first: 5
    sortKey: CREATED_AT
    reverse: true
  ) {

    edges {

      node {

        id

        name

        createdAt

        displayFinancialStatus

        currentTotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }

        customer {
          firstName
          lastName
        }

        lineItems(first: 50) {

          edges {

            node {

              quantity

              originalUnitPriceSet {
                shopMoney {
                  amount
                }
              }

              product {
                id
                title
              }

            }

          }

        }

      }

    }

  }

}
`;

export const GET_ANALYTICS = `
query DashboardAnalytics(
  $first: Int!
  $after: String
) {

  orders(
    first: $first
    after: $after
    sortKey: CREATED_AT
    reverse: true
  ) {

    edges {

      node {

        id

        createdAt

        displayFinancialStatus

        displayFulfillmentStatus

        currentTotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }

      }

    }

    pageInfo {
      hasNextPage
      endCursor
    }

  }

  products(first: 250) {

    edges {

      node {

        id

        title

        status

      }

    }

  }

}
`;