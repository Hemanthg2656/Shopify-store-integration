import helmet from "helmet";

const helmetMiddleware = helmet({
  crossOriginResourcePolicy: {
    policy: "cross-origin",
  },

  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },

  hsts: process.env.NODE_ENV === "production",
});

export default helmetMiddleware;
