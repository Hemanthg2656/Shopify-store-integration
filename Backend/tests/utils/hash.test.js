import { describe, test, expect } from "@jest/globals";
import { hashRefreshToken } from "../../src/utils/hash.js";

describe("hashRefreshToken", () => {
  test("should return a SHA-256 hash", () => {
    const token = "myRefreshToken123";

    const hash = hashRefreshToken(token);

    expect(hash).toHaveLength(64);
    expect(typeof hash).toBe("string");
  });

  test("should produce the same hash for the same token", () => {
    const token = "same-token";

    const hash1 = hashRefreshToken(token);
    const hash2 = hashRefreshToken(token);

    expect(hash1).toBe(hash2);
  });

  test("should produce different hashes for different tokens", () => {
    const hash1 = hashRefreshToken("token-one");
    const hash2 = hashRefreshToken("token-two");

    expect(hash1).not.toBe(hash2);
  });

  test("should correctly hash an empty string", () => {
    const hash = hashRefreshToken("");

    expect(hash).toHaveLength(64);
  });

  test("should correctly hash a long token", () => {
    const token = "a".repeat(1000);

    const hash = hashRefreshToken(token);

    expect(hash).toHaveLength(64);
  });
});