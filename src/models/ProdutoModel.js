// Importa a conexao com o banco de dados.
// Esse arquivo database.js e quem cria a comunicacao com o MySQL.
const db = require("../config/database");

// Cria a classe do model de produto.
// O model e a parte responsavel por falar com o banco.
class ProdutoModel {
  // Este metodo garante que a tabela estoque exista no banco.
  // Se a tabela ainda nao existir, ela sera criada.
  async garantirEstrutura() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS estoque (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        categoria VARCHAR(100) NOT NULL DEFAULT 'Escolar',
        preco DECIMAL(10, 2) NOT NULL DEFAULT 0,
        quantidade INT NOT NULL DEFAULT 0
      )
    `);
  }

  // Este metodo lista todos os produtos cadastrados.
  // Ele faz um SELECT na tabela estoque.
  async listarTodos() {
    const [produtos] = await db.query(
      "SELECT id, nome, categoria, preco, quantidade FROM estoque ORDER BY id DESC"
    );

    // Retorna a lista de produtos encontrada no banco.
    return produtos;
  }

  // Este metodo busca apenas um produto pelo id
  // Ele faz um SELECT filtrando pelo id recebido
  async buscarPorId(id) {
    const [produtos] = await db.query(
      "SELECT id, nome, categoria, preco, quantidade FROM estoque WHERE id = ?",
      [id]
    );

    // Se encontrar, retorna o primeiro produto.
    // Se nao encontrar, retorna null.
    return produtos[0] || null;
  }

  // Este metodo cadastra um novo produto no banco.
  // Ele faz um INSERT na tabela estoque.
  async criar(produto) {
    const [resultado] = await db.query(
      "INSERT INTO estoque (nome, categoria, preco, quantidade) VALUES (?, ?, ?, ?)",
      [produto.nome, produto.categoria, produto.preco, produto.quantidade]
    );

    // Retorna o id gerado automaticamente pelo banco.
    return resultado.insertId;
  }

  // Este metodo atualiza um produto que ja existe.
  // Ele faz um UPDATE no produto com o id informado.
  async atualizar(id, produto) {
    await db.query(
      "UPDATE estoque SET nome = ?, categoria = ?, preco = ?, quantidade = ? WHERE id = ?",
      [produto.nome, produto.categoria, produto.preco, produto.quantidade, id]
    );
  }

  // Este metodo deleta um produto pelo id.
  // Ele faz um DELETE na tabela estoque.
  async deletar(id) {
    await db.query("DELETE FROM estoque WHERE id = ?", [id]);

    // Conta quantos produtos ainda existem na tabela.
    const [linhas] = await db.query("SELECT COUNT(*) AS total FROM estoque");

    // Se nao existir mais nenhum produto, reinicia o AUTO_INCREMENT para 1.
    // Assim, o proximo produto cadastrado volta a receber id 1.
    if (linhas[0].total === 0) {
      await db.query("ALTER TABLE estoque AUTO_INCREMENT = 1");
    }
  }
}

// Cria um objeto da classe ProdutoModel e exporta esse objeto.
// Assim, esse model pode ser usado em outros arquivos, como no controller.
module.exports = new ProdutoModel();
