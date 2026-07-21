export const ownership = (idParam, allowedRoles = ["admin"]) => {
  return (req, res, next) => {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const targetId = Number(req.params[idParam]);
    const isSelf = req.user.userId === targetId;
    const isPrivileged = allowedRoles.includes(req.user.role);

    if (!isSelf && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

export default ownership;