import { jest } from "@jest/globals";
import { authorize } from "../../src/middleware/authorize.js";

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authorize middleware", () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  it("should return 401 when req.user is missing", () => {
    const req = {};
    const res = createMockRes();

    authorize("admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not authenticated",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when req.user.role is missing", () => {
    const req = { user: {} };
    const res = createMockRes();

    authorize("admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 when the user's role is not in the allowed list", () => {
    const req = { user: { role: "member" } };
    const res = createMockRes();

    authorize("admin", "owner")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You do not have permission to perform this action",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() when the user's role is allowed", () => {
    const req = { user: { role: "admin" } };
    const res = createMockRes();

    authorize("admin", "owner")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should support checking against a single allowed role", () => {
    const req = { user: { role: "owner" } };
    const res = createMockRes();

    authorize("owner")(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});