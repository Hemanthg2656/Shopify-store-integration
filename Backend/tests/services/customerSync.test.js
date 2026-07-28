import { jest } from "@jest/globals";

const mockCreateSyncLog = jest.fn();
const mockUpdateSyncLog = jest.fn();

const mockFetchCustomers = jest.fn();

const mockUpsertCustomer = jest.fn();


jest.unstable_mockModule(
  "../../src/service/syncLog.services.js",
  () => ({
    createSyncLog: mockCreateSyncLog,
    updateSyncLog: mockUpdateSyncLog,
  })
);


jest.unstable_mockModule(
  "../../src/service/ShopifyCustomer.services.js",
  () => ({
    fetchCustomers: mockFetchCustomers,
  })
);


jest.unstable_mockModule(
  "../../src/repositories/customer.repository.js",
  () => ({
    upsertCustomer: mockUpsertCustomer,
  })
);


const { syncCustomers } =
  await import("../../src/service/customerSync.services.js");


describe("syncCustomers",()=>{


beforeEach(()=>{
 jest.clearAllMocks();
});


const userData={
 storeId:1
};



it("should sync customers successfully",async()=>{


mockCreateSyncLog.mockResolvedValue({
 id:10
});


mockFetchCustomers.mockResolvedValue({

customers:[
 {
  id:1,
  email:"test@test.com"
 },
 {
  id:2,
  email:"abc@test.com"
 }
]

});


mockUpsertCustomer.mockResolvedValue({});


const result =
 await syncCustomers(userData);



expect(mockCreateSyncLog)
.toHaveBeenCalledWith(
 1,
 "MANUAL",
 "CUSTOMERS"
);



expect(mockUpsertCustomer)
.toHaveBeenCalledTimes(2);



expect(mockUpdateSyncLog)
.toHaveBeenCalledWith(
 10,
 "SUCCESS",
 2,
 null
);



expect(result)
.toEqual({
 synced:2
});


});



it("should update sync log failed when error occurs",async()=>{


mockCreateSyncLog.mockResolvedValue({
 id:10
});


mockFetchCustomers.mockRejectedValue(
 new Error("Shopify API failed")
);



await expect(
 syncCustomers(userData)
)
.rejects
.toThrow(
 "Shopify API failed"
);



expect(mockUpdateSyncLog)
.toHaveBeenCalledWith(
 10,
 "FAILED",
 0,
 "Shopify API failed"
);


});


});