import { jest } from "@jest/globals";


const mockCreateSyncLog = jest.fn();
const mockUpdateSyncLog = jest.fn();


const mockFetchProducts = jest.fn();


const mockUpsertProduct = jest.fn();

const mockDeleteImages = jest.fn();
const mockUpsertImage = jest.fn();

const mockDeleteVariants = jest.fn();
const mockUpsertVariant = jest.fn();



jest.unstable_mockModule(
 "../../src/service/syncLog.services.js",
 ()=>({
  createSyncLog:mockCreateSyncLog,
  updateSyncLog:mockUpdateSyncLog
 })
);



jest.unstable_mockModule(
 "../../src/service/shopifyProduct.services.js",
 ()=>({
  fetchProducts:mockFetchProducts
 })
);



jest.unstable_mockModule(
 "../../src/repositories/product.repository.js",
 ()=>({
  upsertProduct:mockUpsertProduct
 })
);



jest.unstable_mockModule(
 "../../src/repositories/productImage.repository.js",
 ()=>({
  deleteImagesByProductId:mockDeleteImages,
  upsertProductImage:mockUpsertImage
 })
);



jest.unstable_mockModule(
 "../../src/repositories/productVariant.repository.js",
 ()=>({
  deleteVariantsByProductId:mockDeleteVariants,
  upsertVariant:mockUpsertVariant
 })
);



const {syncProducts}
=
await import("../../src/service/productSync.services.js");



describe("syncProducts",()=>{


beforeEach(()=>{
 jest.clearAllMocks();
});



it("should sync products successfully",async()=>{


mockCreateSyncLog.mockResolvedValue({
 id:1
});



mockFetchProducts.mockResolvedValue({

products:[
 {
  title:"Laptop",

  images:[
   {
    url:"image1"
   }
  ],

  variants:[
   {
    sku:"SKU1"
   }
  ]
 }
]

});



mockUpsertProduct.mockResolvedValue({

rows:[
 {
  id:100
 }
]

});



const result =
await syncProducts({
 storeId:1
});



expect(mockDeleteImages)
.toHaveBeenCalledWith(100);



expect(mockUpsertImage)
.toHaveBeenCalled();



expect(mockDeleteVariants)
.toHaveBeenCalledWith(100);



expect(mockUpsertVariant)
.toHaveBeenCalled();



expect(mockUpdateSyncLog)
.toHaveBeenCalledWith(
1,
"SUCCESS",
1,
null
);



expect(result)
.toEqual({
 synced:1
});


});



it("should handle product sync failure",async()=>{


mockCreateSyncLog.mockResolvedValue({
 id:1
});


mockFetchProducts.mockRejectedValue(
new Error("Product API failed")
);



await expect(
syncProducts({
 storeId:1
})
)
.rejects
.toThrow(
"Product API failed"
);



expect(mockUpdateSyncLog)
.toHaveBeenCalledWith(
1,
"FAILED",
0,
"Product API failed"
);


});


});