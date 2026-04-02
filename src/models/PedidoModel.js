// Importa a conexao com o banco de dados
const db = require("../config/database");

// Cria a classe do model de pedidos
class PedidoModel {
  // Lista as colunas existentes de uma tabela
  async listarColunasDaTabela(nomeTabela) {
    const [colunas] = await db.query(
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      `,
      [nomeTabela]
    );

    return new Set(colunas.map((coluna) => coluna.COLUMN_NAME));
  }

  // Garante que a tabela principal de pedidos exista
  async garantirEstrutura() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0
      )
    `);

    const colunasPedido = await this.listarColunasDaTabela("pedidos");

    if (!colunasPedido.has("valor_total")) {
      await db.query(`
        ALTER TABLE pedidos
        ADD COLUMN valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER id
      `);
    }

    // Se a tabela antiga ainda tiver essas colunas do modelo anterior,
    // deixamos elas opcionais para o pedido principal funcionar
    if (colunasPedido.has("produto_id")) {
      await db.query(`
        ALTER TABLE pedidos
        MODIFY COLUMN produto_id INT NULL
      `);
    }

    if (colunasPedido.has("quantidade")) {
      await db.query(`
        ALTER TABLE pedidos
        MODIFY COLUMN quantidade INT NOT NULL DEFAULT 0
      `);
    }

    if (colunasPedido.has("valor_unitario")) {
      await db.query(`
        ALTER TABLE pedidos
        MODIFY COLUMN valor_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0
      `);
    }

    // Esta tabela guarda os produtos de cada pedido
    await db.query(`
      CREATE TABLE IF NOT EXISTS pedido_itens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT NOT NULL,
        produto_id INT NOT NULL,
        quantidade INT NOT NULL,
        valor_unitario DECIMAL(10, 2) NOT NULL,
        valor_total DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        FOREIGN KEY (produto_id) REFERENCES estoque(id)
      )
    `);
  }

  // Lista todos os pedidos cadastrados
  async listarTodos() {
    const [pedidos] = await db.query(`
      SELECT
        pedidos.id,
        pedidos.valor_total,
        COUNT(pedido_itens.id) AS total_itens
      FROM pedidos
      LEFT JOIN pedido_itens ON pedido_itens.pedido_id = pedidos.id
      GROUP BY pedidos.id, pedidos.valor_total
      ORDER BY pedidos.id DESC
    `);

    return pedidos;
  }

  // Busca um pedido pelo id junto com seus itens
  async buscarPorId(id) {
    const [pedidos] = await db.query(
      `
        SELECT
          id,
          valor_total
        FROM pedidos
        WHERE id = ?
      `,
      [id]
    );

    if (!pedidos.length) {
      return null;
    }

    const [itens] = await db.query(
      `
        SELECT
          pedido_itens.id,
          pedido_itens.produto_id,
          estoque.nome AS produto_nome,
          estoque.preco AS produto_preco_atual,
          pedido_itens.quantidade,
          pedido_itens.valor_unitario,
          pedido_itens.valor_total
        FROM pedido_itens
        INNER JOIN estoque ON estoque.id = pedido_itens.produto_id
        WHERE pedido_itens.pedido_id = ?
        ORDER BY pedido_itens.id ASC
      `,
      [id]
    );

    return {
      ...pedidos[0],
      itens,
    };
  }

  // Cria o pedido principal
  async criarPedido(valorTotal) {
    const [resultado] = await db.query(
      "INSERT INTO pedidos (valor_total) VALUES (?)",
      [valorTotal]
    );

    return resultado.insertId;
  }

  // Cria um item dentro do pedido
  async criarItem(item) {
    await db.query(
      `
        INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, valor_unitario, valor_total)
        VALUES (?, ?, ?, ?, ?)
      `,
      [item.pedido_id, item.produto_id, item.quantidade, item.valor_unitario, item.valor_total]
    );
  }

  // Deleta um pedido pelo id
  async deletar(id) {
    await db.query("DELETE FROM pedidos WHERE id = ?", [id]);
  }
}

// Exporta o model de pedidos
module.exports = new PedidoModel();
