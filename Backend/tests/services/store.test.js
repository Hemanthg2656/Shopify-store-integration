import { jest } from "@jest/globals";

// ---------------- MOCKS ----------------

const mockFindByStoreIdFromPool = jest.fn();
const mockShopifyGraphqlClient = jest.fn();

jest.unstable_mockModule(
  "../../src/repositories/accessToken.repository.js",
  () => ({
    findByStoreIdFromPool: mockFindByStoreIdFromPool,
  }),
);

jest.unstable_mockModule(
  "../../src/utils/shopifyGraphqlClient.js",
  () => ({
    shopifyGraphqlClient: mockShopifyGraphqlClient,
  }),
);

jest.unstable_mockModule(
  "../../src/GraphQL/storeQueries.js",
  () => ({
    GET_STORE_DETAILS: "GET_STORE_DETAILS_QUERY",
  }),
);


// -------- IMPORT AFTER MOCKS --------

const { getStoreDetails } =
  await import("../../src/service/store.services.js");


describe("store.services", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


  const userData = {
    storeId: 1,
    shop: "demo.myshopify.com",
  };


  it("should throw 401 when access token is missing", async () => {

    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });


    await expect(
      getStoreDetails(userData)
    ).rejects.toThrow(
      "Access token not found"
    );
  });



  it("should attach statusCode 401 when token missing", async () => {

    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });


    try {

      await getStoreDetails(userData);

    } catch(error){

      expect(error.statusCode)
        .toBe(401);

    }

  });



  it("should return store details successfully", async () => {


    mockFindByStoreIdFromPool.mockResolvedValue({

      rowCount: 1,

      rows:[
        {
          access_token:"shopify-token"
        }
      ]

    });



    mockShopifyGraphqlClient.mockResolvedValue({

      shop:{

        id:"gid://shopify/Shop/1",

        name:"Demo Store",

        myshopifyDomain:"demo.myshopify.com",

        primaryDomain:{
          host:"demo.com"
        },

        email:"owner@test.com",

        currencyCode:"USD",

        ianaTimezone:"America/New_York",

        timezoneAbbreviation:"EST",


        plan:{
          displayName:"Basic",

          partnerDevelopment:false,

          shopifyPlus:false,
        },


        billingAddress:{

          firstName:"John",

          lastName:"Doe",

          address1:"123 Street",

          city:"New York",

          province:"NY",

          country:"USA",

          zip:"10001",

        },


        createdAt:"2024-01-01",

      }

    });



    const result =
      await getStoreDetails(userData);



    expect(
      mockFindByStoreIdFromPool
    ).toHaveBeenCalledWith(1);



    expect(
      mockShopifyGraphqlClient
    ).toHaveBeenCalledWith({

      shop:"demo.myshopify.com",

      accessToken:"shopify-token",

      query:"GET_STORE_DETAILS_QUERY",

    });



    expect(result)
      .toEqual({

        id:"gid://shopify/Shop/1",

        storeName:"Demo Store",

        domain:"demo.myshopify.com",

        primaryDomain:"demo.com",

        email:"owner@test.com",

        currency:"USD",

        timezone:"America/New_York",

        timezoneShort:"EST",

        plan:"Basic",

        isDevelopmentStore:false,

        isPlus:false,

        owner:"John Doe",

        address:{

          address1:"123 Street",

          city:"New York",

          province:"NY",

          country:"USA",

          zip:"10001",

        },

        createdAt:"2024-01-01",

      });

  });



  it("should handle missing optional billing fields", async()=>{


    mockFindByStoreIdFromPool.mockResolvedValue({

      rowCount:1,

      rows:[
        {
          access_token:"token"
        }
      ]

    });



    mockShopifyGraphqlClient.mockResolvedValue({

      shop:{

        id:"1",

        name:"Store",

        myshopifyDomain:"store.myshopify.com",

        email:"test@test.com",

        currencyCode:"USD",

        ianaTimezone:"UTC",

        timezoneAbbreviation:"UTC",


        plan:{

          displayName:"Basic",

          partnerDevelopment:false,

          shopifyPlus:false,

        },


        billingAddress:null,

        createdAt:"today"

      }

    });



    const result =
      await getStoreDetails(userData);



    expect(result.owner)
      .toBe("");



    expect(result.primaryDomain)
      .toBeUndefined();

  });

});