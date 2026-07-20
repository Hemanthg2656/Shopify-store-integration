
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;
const KEY_LENGTH_BYTES = 32; 
const ENCRYPTED_TOKEN_PATTERN = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/i;

let cachedKey = null;

const getEncryptionKey = () => {
  if (cachedKey) return cachedKey;

  const keyHex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY is not set. Generate one with: " +
        `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
    );
  }

  const key = Buffer.from(keyHex, "hex");
  if (key.length !== KEY_LENGTH_BYTES) {
    throw new Error(
      `TOKEN_ENCRYPTION_KEY must decode to ${KEY_LENGTH_BYTES} bytes (64 hex characters). ` +
        `Got ${key.length} bytes.`,
    );
  }

  cachedKey = key;
  return cachedKey;
};

export const isEncryptedToken = (value) => {
  return typeof value === "string" && ENCRYPTED_TOKEN_PATTERN.test(value);
};

export const encryptAccessToken = (plainText) => {
  if (typeof plainText !== "string" || plainText.length === 0) {
    throw new Error("encryptAccessToken: plainText must be a non-empty string");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

export const decryptAccessToken = (storedValue) => {
  if (typeof storedValue !== "string" || storedValue.length === 0) {
    return storedValue;
  }

  if (!isEncryptedToken(storedValue)) {
    return storedValue;
  }

  const key = getEncryptionKey();
  const [ivHex, authTagHex, cipherTextHex] = storedValue.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(cipherTextHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};