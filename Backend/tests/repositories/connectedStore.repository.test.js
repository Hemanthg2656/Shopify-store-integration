import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: { query: mockQuery },
}));

const connectedStoreRepository = await import(
  "../../src/repositories/connectedStore.repository.js"
);

describe("connectedStore.repository", () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn() };
  });

  describe("create", () => {
    it("should insert a connected store via the given client", async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ id: 1, store_domain: "demo.myshopify.com" }],
      });

      const result = await connectedStoreRepository.create(mockClient, {
        userId: 5,
        storeName: "Demo Store",
        storeDomain: "demo.myshopify.com",
        ownerName: "John",
        email: "john@test.com",
        planName: "basic",
        currency: "USD",
        timeZone: "Asia/Kolkata",
      });

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO connected_stores"),
        [5, "Demo Store", "demo.myshopify.com", "John", "john@test.com", "basic", "USD", "Asia/Kolkata"],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("findByStoreDomain", () => {
    it("should query a store by domain via the given client", async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ id: 1, store_domain: "demo.myshopify.com" }],
      });

      const result = await connectedStoreRepository.findByStoreDomain(
        mockClient,
        "demo.myshopify.com",
      );

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE store_domain = $1"),
        ["demo.myshopify.com"],
      );
      expect(result.rows[0].id).toBe(1);
    });

    it("should return an empty result when no store matches the domain", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await connectedStoreRepository.findByStoreDomain(
        mockClient,
        "unknown.myshopify.com",
      );

      expect(result.rows).toHaveLength(0);
    });
  });

  describe("findStoreById", () => {
    it("should query a store by id via the pool", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await connectedStoreRepository.findStoreById(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id=$1"),
        [1],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("update", () => {
    it("should separate storeDomain from the other updates and build the value order", async () => {
      mockClient.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const storeData = {
        userId: 5,
        storeName: "New Name",
        ownerName: "John",
        email: "john@test.com",
        planName: "premium",
        currency: "USD",
        timeZone: "Asia/Kolkata",
        storeDomain: "demo.myshopify.com",
      };

      await connectedStoreRepository.update(mockClient, storeData);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE store_domain=$8"),
        [5, "New Name", "John", "john@test.com", "premium", "USD", "Asia/Kolkata", "demo.myshopify.com"],
      );
    });
  });

  describe("findAllStores", () => {
    it("should query id and store_domain for all connected stores via the pool", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ id: 1, store_domain: "a.myshopify.com" }, { id: 2, store_domain: "b.myshopify.com" }],
      });

      const result = await connectedStoreRepository.findAllStores();

      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("FROM connected_stores"));
      expect(result.rows).toHaveLength(2);
    });
  });
});