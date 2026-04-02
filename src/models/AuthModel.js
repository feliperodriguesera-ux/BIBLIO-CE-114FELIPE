// Importa a conexao com o banco.
const db = require("../config/database");

// Model responsavel pela tabela de usuarios.
class AuthModel {
  // Garante que a tabela de usuarios exista.
  async garantirEstrutura() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL
      )
    `);
  }

  // Busca um usuario pelo email.
  async buscarPorEmail(email) {
    const [usuarios] = await db.query(
      "SELECT id, nome, email, senha FROM usuarios WHERE email = ?",
      [email]
    );

    return usuarios[0] || null;
  }

  // Busca um usuario pelo id.
  async buscarPorId(id) {
    const [usuarios] = await db.query(
      "SELECT id, nome, email FROM usuarios WHERE id = ?",
      [id]
    );

    return usuarios[0] || null;
  }

  // Lista todos os usuarios cadastrados.
  async listarTodos() {
    const [usuarios] = await db.query(
      "SELECT id, nome, email FROM usuarios ORDER BY id ASC"
    );

    return usuarios;
  }

  // Cria um novo usuario.
  async criar(usuario) {
    const [resultado] = await db.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
      [usuario.nome, usuario.email, usuario.senha]
    );

    return resultado.insertId;
  }
}

module.exports = new AuthModel();
