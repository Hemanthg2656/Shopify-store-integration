import { jest } from "@jest/globals";
import { validateId } from "../../src/middleware/validateId.js";

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("validateId middleware", () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  it("should call next() when all specified params are positive integers", () => {
    const req = { params: { userId: "5" } };
    const res = createMockRes();

    validateId("userId")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 400 when a param is not a valid number", () => {
    const req = { params: { userId: "abc" } };
    const res = createMockRes();

    validateId("userId")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid userId",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 when a param is zero", () => {
    const req = { params: { userId: "0" } };
    const res = createMockRes();

    validateId("userId")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid userId",
    });
  });

  it("should return 400 when a param is negative", () => {
    const req = { params: { userId: "-5" } };
    const res = createMockRes();

    validateId("userId")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 400 when a param is a non-integer decimal", () => {
    const req = { params: { userId: "5.5" } };
    const res = createMockRes();

    validateId("userId")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should validate multiple fields and stop at the first invalid one", () => {
    const req = { params: { userId: "5", storeId: "abc" } };
    const res = createMockRes();

    validateId("userId", "storeId")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid storeId",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() when all multiple fields are valid", () => {
    const req = { params: { userId: "5", storeId: "10" } };
    const res = createMockRes();

    validateId("userId", "storeId")(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});