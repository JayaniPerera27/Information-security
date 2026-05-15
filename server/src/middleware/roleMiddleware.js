const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    res.status(501).json({
      message: "Role authorization middleware not implemented yet",
      allowedRoles
    });
  };
};

module.exports = authorizeRoles;
