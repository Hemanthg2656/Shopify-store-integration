import { jest } from "@jest/globals";
import { ownership } from "../../src/middleware/ownership.js";

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("ownership middleware", () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  it("should return 401 when req.user is missing", () => {
    const req = { params: { userId: "1" } };
    const res = createMockRes();

    ownership("userId")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not authenticated",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when req.user.userId is missing", () => {
    const req = { user: {}, params: { userId: "1" } };
    const res = createMockRes();

    ownership("userId")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() when the user is accessing their own resource", () => {
    const req = { user: { userId: 5, role: "member" }, params: { userId: "5" } };
    const res = createMockRes();

    ownership("userId")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should call next() when the user is not self but has a privileged role", () => {
    const req = { user: { userId: 5, role: "admin" }, params: { userId: "999" } };
    const res = createMockRes();

    ownership("userId")(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 403 when the user is neither self nor privileged", () => {
    const req = { user: { userId: 5, role: "member" }, params: { userId: "999" } };
    const res = createMockRes();

    ownership("userId")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You do not have permission to perform this action",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should respect a custom allowedRoles list", () => {
    const req = { user: { userId: 5, role: "manager" }, params: { userId: "999" } };
    const res = createMockRes();

    ownership("userId", ["manager", "owner"])(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should use a different route param name when specified", () => {
    const req = { user: { userId: 5, role: "member" }, params: { customerId: "5" } };
    const res = createMockRes();

    ownership("customerId")(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should default allowedRoles to ['admin'] when not provided", () => {
    const req = { user: { userId: 5, role: "admin" }, params: { userId: "999" } };
    const res = createMockRes();

    ownership("userId")(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});