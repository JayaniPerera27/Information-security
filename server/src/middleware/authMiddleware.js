const authenticate = (req, res, next) => {
  res.status(501).json({ message: "Authentication middleware not implemented yet" });
};

module.exports = authenticate;
