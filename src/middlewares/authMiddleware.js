// Importa o jsonwebtoken para validar o token.
const jwt = require("jsonwebtoken");

// Usa a mesma chave do login.
const JWT_SECRET = process.env.JWT_SECRET || "segredo_simples";

// Middleware que valida o token enviado no header Authorization.
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token nao informado." });
  }

  const partes = authHeader.split(" ");
  const token = partes[1];

  if (!token) {
    return res.status(401).json({ erro: "Token invalido." });
  }

  try {
    const dados = jwt.verify(token, JWT_SECRET);
    req.usuario = dados;
    return next();
  } catch (_erro) {
    return res.status(401).json({ erro: "Token invalido ou expirado." });
  }
}

module.exports = autenticarToken;
