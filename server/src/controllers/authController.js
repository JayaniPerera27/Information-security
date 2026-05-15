const register = async (req, res) => {
  res.status(501).json({ message: "Register controller not implemented yet" });
};

const login = async (req, res) => {
  res.status(501).json({ message: "Login controller not implemented yet" });
};

const getCurrentUser = async (req, res) => {
  res.status(501).json({ message: "Current user controller not implemented yet" });
};

module.exports = { register, login, getCurrentUser };
