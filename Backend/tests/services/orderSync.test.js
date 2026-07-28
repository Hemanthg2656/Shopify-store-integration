import { jest } from "@jest/globals";


const mockCreateSyncLog = jest.fn();
const mockUpdateSyncLog = jest.fn();

const mockFetchOrders = jest.fn();

const mockUpsertOrder = jest.fn();



jest.unstable_mockModule(
 "../../src/service/syncLog.services.js",
 ()=>({
  createSyncLog:mockCreateSyncLog,
  updateSyncLog:mockUpdateSyncLog
 })
);



jest.unstable_mockModule(
 "../../src/service/ShopifyOrder.services.js",
 ()=>({
  fetchOrders:mockFetchOrders
 })
);



jest.unstable_mockModule(
 "../../src/repositories/order.repository.js",
 ()=>({
  upsertOrder:mockUpsertOrder
 })
);



const {syncOrders}
=
await import("../../src/service/orderSync.services.js");



describe("syncOrders",()=>{


beforeEach(()=>{
 jest.clearAllMocks();
});


const userData={
 storeId:1
};



it("should sync orders successfully",async()=>{


mockCreateSyncLog.mockResolvedValue({
 id:5
});


mockFetchOrders.mockResolvedValue({

orders:[
 {id:1},
 {id:2}
]

});



const result =
await syncOrders(userData);



expect(mockUpsertOrder)
.toHaveBeenCalledTimes(2);



expect(mockUpdateSyncLog)
.toHaveBeenCalledWith(
5,
"SUCCESS",
2,
null
);



expect(result)
.toEqual({
 synced:2
});


});



it("should handle order sync failure",async()=>{


mockCreateSyncLog.mockResolvedValue({
 id:5
});


mockFetchOrders.mockRejectedValue(
new Error("Order API error")
);



await expect(
syncOrders(userData)
)
.rejects
.toThrow(
"Order API error"
);



expect(mockUpdateSyncLog)
.toHaveBeenCalledWith(
5,
"FAILED",
0,
"Order API error"
);


});


});