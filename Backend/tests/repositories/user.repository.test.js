import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: { query: mockQuery },
}));

const userRepository = await import("../../src/repositories/user.repository.js");

describe("user.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should insert a user and return the row", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, name: "Jane", email: "jane@test.com" }] });

      const result = await userRepository.create("Jane", "jane@test.com");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        ["Jane", "jane@test.com"],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("findAll", () => {
    it("should query all users ordered by id", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });

      const result = await userRepository.findAll();

      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("ORDER BY id ASC"));
      expect(result.rows).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("should query a user by id", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await userRepository.findById(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1"),
        [1],
      );
      expect(result.rows[0].id).toBe(1);
    });

    it("should return an empty result when user not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await userRepository.findById(999);

      expect(result.rows).toHaveLength(0);
    });
  });

  describe("findByEmail", () => {
    it("should query a user by email", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, email: "jane@test.com" }] });

      const result = await userRepository.findByEmail("jane@test.com");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE email = $1"),
        ["jane@test.com"],
      );
      expect(result.rows[0].email).toBe("jane@test.com");
    });
  });

  describe("remove", () => {
    it("should delete a user by id and return the deleted row", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await userRepository.remove(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM users"),
        [1],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("update", () => {
    it("should build a dynamic SET clause from the updates object", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, name: "New Name" }] });

      const result = await userRepository.update(1, { name: "New Name", email: "new@test.com" });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("name = $1, email = $2"),
        ["New Name", "new@test.com", 1],
      );
      expect(result.rows[0].name).toBe("New Name");
    });

    it("should handle a single-field update", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, name: "Solo" }] });

      await userRepository.update(1, { name: "Solo" });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("name = $1"),
        ["Solo", 1],
      );
    });

    it("should propagate database errors", async () => {
      mockQuery.mockRejectedValue(new Error("Database error"));

      await expect(userRepository.update(1, { name: "X" })).rejects.toThrow(
        "Database error",
      );
    });
  });
});