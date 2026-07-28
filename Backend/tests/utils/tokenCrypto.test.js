import { jest } from "@jest/globals";

describe("tokenCrypto", () => {
  const originalEnv = process.env.TOKEN_ENCRYPTION_KEY;

  afterEach(() => {
    process.env.TOKEN_ENCRYPTION_KEY = originalEnv;
  });

  describe("when TOKEN_ENCRYPTION_KEY is not set", () => {
    it("should throw when encryptAccessToken is called", async () => {
      delete process.env.TOKEN_ENCRYPTION_KEY;
      jest.resetModules();

      const { encryptAccessToken } = await import(
        "../../src/utils/tokenCrypto.js"
      );

      expect(() => encryptAccessToken("plain-token")).toThrow(
        "TOKEN_ENCRYPTION_KEY is not set",
      );
    });
  });

  describe("when TOKEN_ENCRYPTION_KEY has the wrong length", () => {
    it("should throw when encryptAccessToken is called", async () => {
      process.env.TOKEN_ENCRYPTION_KEY = "abcd"; // far too short
      jest.resetModules();

      const { encryptAccessToken } = await import(
        "../../src/utils/tokenCrypto.js"
      );

      expect(() => encryptAccessToken("plain-token")).toThrow(
        "TOKEN_ENCRYPTION_KEY must decode to 32 bytes",
      );
    });
  });

  describe("with a valid 64-hex-character key", () => {
    let tokenCrypto;

    beforeEach(async () => {
      process.env.TOKEN_ENCRYPTION_KEY =
        "a".repeat(64); // 32 bytes when hex-decoded
      jest.resetModules();
      tokenCrypto = await import("../../src/utils/tokenCrypto.js");
    });

    describe("encryptAccessToken / decryptAccessToken", () => {
      it("should round-trip a plain-text token through encrypt then decrypt", () => {
        const encrypted = tokenCrypto.encryptAccessToken("shpat_abc123");

        expect(encrypted).toMatch(/^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/i);

        const decrypted = tokenCrypto.decryptAccessToken(encrypted);

        expect(decrypted).toBe("shpat_abc123");
      });

      it("should produce a different ciphertext each time due to a random IV", () => {
        const first = tokenCrypto.encryptAccessToken("shpat_abc123");
        const second = tokenCrypto.encryptAccessToken("shpat_abc123");

        expect(first).not.toBe(second);
      });

      it("should throw when encrypting a non-string value", () => {
        expect(() => tokenCrypto.encryptAccessToken(12345)).toThrow(
          "encryptAccessToken: plainText must be a non-empty string",
        );
      });

      it("should throw when encrypting an empty string", () => {
        expect(() => tokenCrypto.encryptAccessToken("")).toThrow(
          "encryptAccessToken: plainText must be a non-empty string",
        );
      });

      it("should return the value unchanged when decrypting a non-encrypted plain string", () => {
        const result = tokenCrypto.decryptAccessToken("shpat_plaintext_token");

        expect(result).toBe("shpat_plaintext_token");
      });

      it("should return the value unchanged when decrypting null-ish or empty input", () => {
        expect(tokenCrypto.decryptAccessToken("")).toBe("");
        expect(tokenCrypto.decryptAccessToken(undefined)).toBeUndefined();
      });

      it("should throw when the auth tag has been tampered with", () => {
        const encrypted = tokenCrypto.encryptAccessToken("shpat_abc123");
        const [iv, authTag, cipherText] = encrypted.split(":");
        const tamperedAuthTag = authTag.replace(/^./, authTag[0] === "0" ? "1" : "0");
        const tampered = `${iv}:${tamperedAuthTag}:${cipherText}`;

        expect(() => tokenCrypto.decryptAccessToken(tampered)).toThrow();
      });
    });

    describe("isEncryptedToken", () => {
      it("should return true for a validly-shaped encrypted token", () => {
        const encrypted = tokenCrypto.encryptAccessToken("shpat_abc123");

        expect(tokenCrypto.isEncryptedToken(encrypted)).toBe(true);
      });

      it("should return false for a plain-text token", () => {
        expect(tokenCrypto.isEncryptedToken("shpat_plaintext")).toBe(false);
      });

      it("should return false for a non-string value", () => {
        expect(tokenCrypto.isEncryptedToken(12345)).toBe(false);
        expect(tokenCrypto.isEncryptedToken(null)).toBe(false);
        expect(tokenCrypto.isEncryptedToken(undefined)).toBe(false);
      });

      it("should return false for a string that merely resembles the pattern", () => {
        expect(tokenCrypto.isEncryptedToken("not:a:validtoken")).toBe(false);
      });
    });
  });
});