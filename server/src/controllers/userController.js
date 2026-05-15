const getUsers = async (req, res) => {
  res.status(501).json({ message: "User listing controller not implemented yet" });
};

const getPublicKey = async (req, res) => {
  res.status(501).json({ message: "Public key controller not implemented yet" });
};

module.exports = { getUsers, getPublicKey };
