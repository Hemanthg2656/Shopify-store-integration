import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: { query: mockQuery },
}));

const customerRepository =
  await import("../../src/repositories/customer.repository.js");

describe("customer.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("upsertCustomer", () => {
    it("should insert/upsert a customer with all fields in order", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const customer = {
        storeId: 1,
        shopifyCustomerId: "gid://shopify/Customer/1",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@test.com",
        phone: "+1234567890",
        ordersCount: 3,
        totalSpent: "150.00",
        state: "ENABLED",
        createdAtShopify: "2024-01-01",
        updatedAtShopify: "2024-01-02",
      };

      await customerRepository.upsertCustomer(customer);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT (store_id, shopify_customer_id)"),
        [
          1,
          "gid://shopify/Customer/1",
          "Jane",
          "Doe",
          "jane@test.com",
          "+1234567890",
          3,
          "150.00",
          "ENABLED",
          "2024-01-01",
          "2024-01-02",
        ],
      );
    });
  });

  describe("findCustomers", () => {
    it("should query with only the base store filter when no optional params given", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await customerRepository.findCustomers(1, {});

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("WHERE store_id = $1"),
        [1],
      );
      expect(result).toEqual({ rows: [], total: 0 });
    });

    it("should add a search filter across first name, last name, and email", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "1" }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await customerRepository.findCustomers(1, { search: "jane" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("email ILIKE $2"),
        [1, "%jane%"],
      );
    });

    it("should sort oldest first when sort=oldest", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      await customerRepository.findCustomers(1, { sort: "oldest" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("ORDER BY created_at_shopify ASC"),
        expect.any(Array),
      );
    });

    it("should default to newest-first sort for an unrecognized sort value", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      await customerRepository.findCustomers(1, { sort: "bogus" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("ORDER BY created_at_shopify DESC"),
        expect.any(Array),
      );
    });

    it("should compute the correct offset for a given page and limit", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "50" }] })
        .mockResolvedValueOnce({ rows: [] });

      await customerRepository.findCustomers(1, { page: 3, limit: 20 });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        [1, 20, 40],
      );
    });

    it("should propagate database errors", async () => {
      mockQuery.mockRejectedValue(new Error("Database error"));

      await expect(customerRepository.findCustomers(1, {})).rejects.toThrow(
        "Database error",
      );
    });
    it("should default queryParams to an empty object when omitted", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await customerRepository.findCustomers(1);

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("WHERE store_id = $1"),
        [1],
      );
      expect(result).toEqual({ rows: [], total: 0 });
    });
  });

  describe("findCustomerByShopifyId", () => {
    it("should query a customer by store id and shopify customer id", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await customerRepository.findCustomerByShopifyId(
        1,
        "gid://shopify/Customer/1",
      );

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("AND shopify_customer_id = $2"),
        [1, "gid://shopify/Customer/1"],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("deleteCustomersByStore", () => {
    it("should delete all customers for a store", async () => {
      mockQuery.mockResolvedValue({ rowCount: 8 });

      const result = await customerRepository.deleteCustomersByStore(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM customers"),
        [1],
      );
      expect(result.rowCount).toBe(8);
    });
  });
});
