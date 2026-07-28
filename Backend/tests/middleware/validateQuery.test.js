import { jest } from "@jest/globals";
import { z } from "zod";
import { validateQuery } from "../../src/middleware/validateQuery.js";

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("validateQuery middleware", () => {
  let next;
  const schema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  });

  beforeEach(() => {
    next = jest.fn();
  });

  it("should attach the parsed data to req.validatedQuery and call next() on success", () => {
    const req = { query: { page: "2", limit: "20" } };
    const res = createMockRes();

    validateQuery(schema)(req, res, next);

    expect(req.validatedQuery).toEqual({ page: 2, limit: 20 });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should apply schema defaults when fields are omitted", () => {
    const req = { query: {} };
    const res = createMockRes();

    validateQuery(schema)(req, res, next);

    expect(req.validatedQuery).toEqual({ page: 1, limit: 10 });
    expect(next).toHaveBeenCalled();
  });

  it("should return 400 with validation issues when the query fails the schema", () => {
    const req = { query: { page: "-1" } };
    const res = createMockRes();

    validateQuery(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Validation failed",
        errors: expect.any(Array),
      }),
    );
    expect(next).not.toHaveBeenCalled();
    expect(req.validatedQuery).toBeUndefined();
  });

  it("should return 400 when a non-numeric value is passed for a numeric field", () => {
    const req = { query: { page: "not-a-number" } };
    const res = createMockRes();

    validateQuery(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});