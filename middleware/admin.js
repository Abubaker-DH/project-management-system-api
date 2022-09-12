module.exports = function (req, res, next) {
  // INFO: 401 Unauthorized 403 Forbidden
  if (req.user.role !== "admin") return res.status(401).send("Access denied.");

  next();
};
