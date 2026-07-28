import { jest } from "@jest/globals";

describe("logger", () => {
  const originalEnv = process.env.NODE_ENV;
  let mockPino;

  beforeEach(() => {
    mockPino = jest.fn().mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    });

    jest.unstable_mockModule("pino", () => ({
      default: mockPino,
    }));
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  it("should configure a pino-pretty transport when NODE_ENV is not production", async () => {
    process.env.NODE_ENV = "development";
    jest.resetModules();

    const { default: logger } = await import("../../src/utils/logger.js");

    expect(mockPino).toHaveBeenCalledWith({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      },
    });
    expect(logger.error).toBeDefined();
  });

  it("should configure a pino-pretty transport when NODE_ENV is test", async () => {
    process.env.NODE_ENV = "test";
    jest.resetModules();

    await import("../../src/utils/logger.js");

    expect(mockPino).toHaveBeenCalledWith({
      transport: expect.objectContaining({ target: "pino-pretty" }),
    });
  });

  it("should disable the transport (plain JSON output) when NODE_ENV is production", async () => {
    process.env.NODE_ENV = "production";
    jest.resetModules();

    await import("../../src/utils/logger.js");

    expect(mockPino).toHaveBeenCalledWith({
      transport: undefined,
    });
  });

  it("should export the pino instance as the default export", async () => {
    process.env.NODE_ENV = "development";
    jest.resetModules();

    const loggerModule = await import("../../src/utils/logger.js");

    expect(loggerModule.default).toBeDefined();
    expect(typeof loggerModule.default.error).toBe("function");
  });
});