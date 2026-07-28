import { jest } from "@jest/globals";

const mockGetAllUsers = jest.fn();
const mockGetUserById = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();

jest.unstable_mockModule("../../src/service/user.services.js", () => ({
  getAllUsers: mockGetAllUsers,
  getUserById: mockGetUserById,
  updateUser: mockUpdateUser,
  deleteUser: mockDeleteUser,
}));

// Real zod schema is used (deterministic, no external deps)

const userController = await import("../../src/controller/user.controller.js");

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("user.controller", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("getAllUsers", () => {
    it("should return all users on success", async () => {
      const req = {};
      const res = createMockRes();

      mockGetAllUsers.mockResolvedValue({
        rowCount: 2,
        rows: [{ id: 1 }, { id: 2 }],
      });

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Users fetched successfully",
        usersCount: 2,
        users: [{ id: 1 }, { id: 2 }],
      });
    });

    it("should return 500 on a database error", async () => {
      const req = {};
      const res = createMockRes();

      mockGetAllUsers.mockRejectedValue(new Error("Database error"));

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal Server Error",
      });
    });
  });

  describe("getUser", () => {
    it("should return the user when found", async () => {
      const req = { params: { userId: "1" } };
      const res = createMockRes();

      mockGetUserById.mockResolvedValue({ rowCount: 1, rows: [{ id: 1 }] });

      await userController.getUser(req, res);

      expect(mockGetUserById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User fetched successfully",
        user: { id: 1 },
      });
    });

    it("should return 404 when the user does not exist", async () => {
      const req = { params: { userId: "999" } };
      const res = createMockRes();

      mockGetUserById.mockResolvedValue({ rowCount: 0, rows: [] });

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should return 500 on a database error", async () => {
      const req = { params: { userId: "1" } };
      const res = createMockRes();

      mockGetUserById.mockRejectedValue(new Error("Database error"));

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal Server Error",
      });
    });
  });

  describe("updateUser", () => {
    it("should return 400 when the body fails validation", async () => {
      const req = { params: { userId: "1" }, body: {} };
      const res = createMockRes();

      await userController.updateUser(req, res);

      expect(mockUpdateUser).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Validation failed" }),
      );
    });

    it("should update and return the user on success", async () => {
      const req = { params: { userId: "1" }, body: { name: "Jane Doe" } };
      const res = createMockRes();

      mockUpdateUser.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 1, name: "Jane Doe" }],
      });

      await userController.updateUser(req, res);

      expect(mockUpdateUser).toHaveBeenCalledWith("1", { name: "Jane Doe" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User updated successfully",
        user: { id: 1, name: "Jane Doe" },
      });
    });

    it("should return 404 when the user does not exist", async () => {
      const req = { params: { userId: "999" }, body: { name: "Jane Doe" } };
      const res = createMockRes();

      mockUpdateUser.mockResolvedValue({ rowCount: 0, rows: [] });

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should return 409 when the email uniqueness constraint is violated", async () => {
      const req = { params: { userId: "1" }, body: { email: "taken@test.com" } };
      const res = createMockRes();

      const error = new Error("duplicate key value");
      error.code = "23505";
      mockUpdateUser.mockRejectedValue(error);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email already exists",
      });
    });

    it("should return 500 on any other database error", async () => {
      const req = { params: { userId: "1" }, body: { name: "Jane Doe" } };
      const res = createMockRes();

      mockUpdateUser.mockRejectedValue(new Error("Database error"));

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal Server Error",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete and return the user on success", async () => {
      const req = { params: { userId: "1" } };
      const res = createMockRes();

      mockDeleteUser.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 1 }],
      });

      await userController.deleteUser(req, res);

      expect(mockDeleteUser).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully",
        user: { id: 1 },
      });
    });

    it("should return 404 when the user does not exist", async () => {
      const req = { params: { userId: "999" } };
      const res = createMockRes();

      mockDeleteUser.mockResolvedValue({ rowCount: 0, rows: [] });

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should return 500 on a database error", async () => {
      const req = { params: { userId: "1" } };
      const res = createMockRes();

      mockDeleteUser.mockRejectedValue(new Error("Database error"));

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal Server Error",
      });
    });
  });
});