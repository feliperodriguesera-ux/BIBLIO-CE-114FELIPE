// Importa o model de pedidos
const PedidoModel = require("../models/PedidoModel");

// Importa o model de produtos para validar cada item comprado
const ProdutoModel = require("../models/ProdutoModel");

// Cria a classe do controller de pedidos
class PedidoController {
  // le o body da requisicao
  lerBody(body) {
    if (typeof body === "string") {
      try {
        return JSON.parse(body);
      } catch (_erro) {
        return {};
      }
    }

    return body || {};
  }

  // Valida a lista de itens do pedido
  validarItens(itens) {
    if (!Array.isArray(itens) || !itens.length) {
      return "Informe pelo menos um item no pedido";
    }

    for (const item of itens) {
      if (!Number.isInteger(Number(item.produto_id)) || Number(item.produto_id) <= 0) {
        return "Informe um produto_id valido";
      }

      if (!Number.isInteger(Number(item.quantidade)) || Number(item.quantidade) <= 0) {
        return "Informe uma quantidade valida";
      }
    }

    return null;
  }

  // Lista todos os pedidos
  async listar(_req, res) {
    try {
      const pedidos = await PedidoModel.listarTodos();

      if (!pedidos.length) {
        return res.json({ mensagem: "Nenhum pedido cadastrado" });
      }

      return res.json(pedidos);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  }

  // Busca um pedido pelo id
  async buscarPorId(req, res) {
    try {
      const pedido = await PedidoModel.buscarPorId(Number(req.params.id));

      if (!pedido) {
        return res.status(404).json({ erro: "Pedido nao encontrado." });
      }

      return res.json(pedido);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  }

  // Cadastra um novo pedido com varios produtos
  async cadastrar(req, res) {
    try {
      const body = this.lerBody(req.body);

      // Agora o pedido recebe uma lista de itens
      // Cada item tem produto_id e quantidade
      const itens = body.itens || [];
      const erroValidacao = this.validarItens(itens);

      if (erroValidacao) {
        return res.status(400).json({ erro: erroValidacao });
      }

      // Aqui o map percorre a lista de itens e transforma cada item
      // em um objeto mais completo com nome do produto, preco e total
      const itensDoPedido = await Promise.all(
        itens.map(async (item) => {
          const produto = await ProdutoModel.buscarPorId(Number(item.produto_id));

          if (!produto) {
            throw new Error(`Produto ${item.produto_id} nao encontrado.`);
          }

          if (Number(item.quantidade) > produto.quantidade) {
            throw new Error(`Quantidade em estoque insuficiente para o produto ${produto.nome}.`);
          }

          // O valor unitario vem do proprio produto encontrado pelo id
          const valorUnitario = Number(produto.preco);

          // Aqui e onde faz a multiplicacao de quantidade * valor unitario
          const valorTotalItem = Number((valorUnitario * Number(item.quantidade)));

          return {
            produto,
            produto_id: produto.id,
            produto_nome: produto.nome,
            quantidade: Number(item.quantidade),
            valor_unitario: valorUnitario,
            valor_total: valorTotalItem,
          };
        })
      );

      // Depois do map, somamos o total de todos os itens do pedido
      const valorTotalPedido = Number(
        itensDoPedido
          .reduce((total, item) => total + item.valor_total, 0)
      );

      // Cria o pedido principal primeiro
      const pedidoId = await PedidoModel.criarPedido(valorTotalPedido);

      // Depois salva cada item e atualiza o estoque
      for (const item of itensDoPedido) {
        await PedidoModel.criarItem({
          pedido_id: pedidoId,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
        });

        await ProdutoModel.atualizar(item.produto.id, {
          nome: item.produto.nome,
          categoria: item.produto.categoria,
          preco: item.produto.preco,
          quantidade: item.produto.quantidade - item.quantidade,
        });
      }

      return res.status(201).json({
        mensagem: "Pedido cadastrado com sucesso.",
        id: pedidoId,
        valor_total: valorTotalPedido,
        itens: itensDoPedido.map((item) => ({
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
        })),
      });
    } catch (erro) {
      if (erro.message.includes("nao encontrado") || erro.message.includes("insuficiente")) {
        return res.status(400).json({ erro: erro.message });
      }

      return res.status(500).json({ erro: erro.message });
    }
  }

  // Deleta um pedido e devolve as quantidades ao estoque
  async deletar(req, res) {
    try {
      const id = Number(req.params.id);
      const pedido = await PedidoModel.buscarPorId(id);

      if (!pedido) {
        return res.status(404).json({ erro: "Pedido nao encontrado." });
      }

      for (const item of pedido.itens) {
        const produto = await ProdutoModel.buscarPorId(item.produto_id);

        if (produto) {
          await ProdutoModel.atualizar(produto.id, {
            nome: produto.nome,
            categoria: produto.categoria,
            preco: produto.preco,
            quantidade: produto.quantidade + item.quantidade,
          });
        }
      }

      await PedidoModel.deletar(id);

      return res.json({ mensagem: "Pedido deletado com sucesso." });
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  }
}

// Exporta o controller de pedidos
module.exports = new PedidoController();
