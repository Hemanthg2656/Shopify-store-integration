export const GET_STORE_DETAILS = `
query GetStoreDetails {

  shop {

    id

    name

    myshopifyDomain

    email

    currencyCode

    timezoneAbbreviation

    ianaTimezone

    plan {
      displayName
      partnerDevelopment
      shopifyPlus
    }

    billingAddress {
      firstName
      lastName
      country
      province
      city
      zip
      address1
    }

    primaryDomain {
      host
      url
    }

    createdAt

  }

}
`;