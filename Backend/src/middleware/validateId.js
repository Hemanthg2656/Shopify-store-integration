export const validateId = (...fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      const id = Number(req.params[field]);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field}`,
        });
      }
    }
    next();
  };
};