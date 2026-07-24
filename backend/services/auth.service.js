const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function loginUser(email, password) {
  const user = await global.db.collection("users").findOne({ email });
  if (!user) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token, user: { _id: user._id, email: user.email, role: user.role } };
}

module.exports = { loginUser };