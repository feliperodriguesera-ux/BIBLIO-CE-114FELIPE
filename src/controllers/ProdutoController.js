// Importa o model de produto.
// O model e a parte que conversa com o banco de dados.
const ProdutoModel = require("../models/ProdutoModel");

// Cria a classe do controller de produtos.
// O controller recebe a requisicao, trata os dados e chama o model.
class ProdutoController {
  // Este metodo le o body enviado na requisicao.
  // Se vier texto, ele tenta transformar em JSON.
  // Se ja vier objeto, ele apenas devolve o proprio body.
  lerBody(body) {
    // Verifica se o body veio como texto.
    if (typeof body === "string") {
      try {
        // Tenta converter o texto para objeto JSON.
        return JSON.parse(body);
      } catch (_erro) {
        // Se der erro na conversao, devolve objeto vazio.
        return {};
      }
    }

    // Se o body ja for um objeto, devolve ele.
    // Se nao existir, devolve objeto vazio.
    return body || {};
  }

  // Este metodo valida os dados do produto.
  // Ele checa se nome, preco e quantidade estao corretos.
  validarProduto({ nome, preco, quantidade }) {
    // Verifica se o nome foi preenchido.
    if (!nome || !String(nome).trim()) {
      return "Informe o nome do produto.";
    }

    // Verifica se o preco e um numero valido e maior ou igual a zero.
    if (Number(preco) < 0 || Number.isNaN(Number(preco))) {
      return "Informe um preco valido.";
    }

    // Verifica se a quantidade e um numero inteiro e maior ou igual a zero.
    if (!Number.isInteger(Number(quantidade)) || Number(quantidade) < 0) {
      return "Informe uma quantidade valida.";
    }

    // Se estiver tudo certo, nao retorna erro.
    return null;
  }

  // Este metodo monta um objeto produto padronizado.
  // Ele organiza os dados para salvar ou atualizar no banco.
  montarProduto(body) {
    return {
      // Pega o nome enviado e remove espacos no comeco e no fim.
      nome: String(body.nome || "").trim(),

      // Pega a categoria enviada.
      // Se nao vier categoria, usa "Escolar" como padrao.
      categoria: String(body.categoria || "Escolar").trim(),

      // Converte o preco para numero.
      preco: Number(body.preco || 0),

      // Converte a quantidade para numero.
      quantidade: Number(body.quantidade || 0),
    };
  }

  // Metodo responsavel por listar todos os produtos.
  // Ele atende a rota GET /api/produtos
  async listar(_req, res) {
    try {
      // Chama o model para buscar todos os produtos no banco.
      const produtos = await ProdutoModel.listarTodos();

      // Retorna os produtos em formato JSON.
      res.json(produtos);
    } catch (erro) {
      // Se algo der errado, retorna erro 500.
      res.status(500).json({ erro: erro.message });
    }
  }

  // Metodo responsavel por buscar um produto pelo id.
  // Ele atende a rota GET /api/produtos/:id
  async buscarPorId(req, res) {
    try {
      // Pega o id da URL e transforma em numero.
      const produto = await ProdutoModel.buscarPorId(Number(req.params.id));

      // Se o produto nao existir, retorna erro 404.
      if (!produto) {
        return res.status(404).json({ erro: "Produto nao encontrado." });
      }

      // Se encontrar, devolve o produto em JSON.
      return res.json(produto);
    } catch (erro) {
      // Se algo der errado, retorna erro 500.
      return res.status(500).json({ erro: erro.message });
    }
  }

  // Metodo responsavel por cadastrar um novo produto.
  // Ele atende a rota POST /api/produtos
  async cadastrar(req, res) {
    try {
      // Le o body da requisicao.
      const produto = this.montarProduto(this.lerBody(req.body));

      // Valida os dados do produto.
      const erroValidacao = this.validarProduto(produto);

      // Se houver erro de validacao, retorna erro 400.
      if (erroValidacao) {
        return res.status(400).json({ erro: erroValidacao });
      }

      // Chama o model para salvar o produto no banco.
      const id = await ProdutoModel.criar(produto);

      // Retorna mensagem de sucesso e o id gerado.
      return res.status(201).json({ mensagem: "Produto cadastrado com sucesso.", id });
    } catch (erro) {
      // Se algo der errado, retorna erro 500.
      return res.status(500).json({ erro: erro.message });
    }
  }

  // Metodo responsavel por atualizar um produto existente.
  // Ele atende a rota PUT /api/produtos/:id
  async atualizar(req, res) {
    try {
      // Pega o id que veio na URL.
      const id = Number(req.params.id);

      // Busca o produto atual no banco.
      const produtoExistente = await ProdutoModel.buscarPorId(id);

      // Se o produto nao existir, retorna erro 404.
      if (!produtoExistente) {
        return res.status(404).json({ erro: "Produto nao encontrado." });
      }

      // Le o body enviado na requisicao.
      const body = this.lerBody(req.body);

      // Junta os dados antigos com os novos dados enviados.
      // Assim, se algum campo nao for enviado, ele continua com o valor anterior.
      const produto = this.montarProduto({ ...produtoExistente, ...body });

      // Valida os novos dados do produto.
      const erroValidacao = this.validarProduto(produto);

      // Se houver erro de validacao, retorna erro 400.
      if (erroValidacao) {
        return res.status(400).json({ erro: erroValidacao });
      }

      // Chama o model para atualizar no banco
      await ProdutoModel.atualizar(id, produto);

      // Retorna mensagem de sucesso
      return res.json({ mensagem: "Produto atualizado com sucesso." });
    } catch (erro) {
      // Se algo der errado, retorna erro 500
      return res.status(500).json({ erro: erro.message });
    }
  }

  //meetodo responsavel por deletar um produto
  //ele atende a rota DELETE /api/produtos/:id
  async deletar(req, res) {
    try {
      //pega o id enviado na URL.
      const id = Number(req.params.id);

      //Buscaa o produto no banco antes de deleta
      const produto = await ProdutoModel.buscarPorId(id);

      //Se o produto nao existir, retorna erro 404
      if (!produto) {
        return res.status(404).json({ erro: "Produto nao encontrado." });
      }

      // Chama o model para deletar o produto.
      await ProdutoModel.deletar(id);

      // Retorna mensagem confirmando a exclusao.
      return res.json({ mensagem: "Produto deletado com sucesso." });
    } catch (erro) {
      // Se algo der errado, retorna erro 500.
      return res.status(500).json({ erro: erro.message });
    }
  }
}

// Cria um objeto da classe ProdutoController e exporta esse objeto.
// Isso permite usar este controller em outros arquivos, como nas rotas.
module.exports = new ProdutoController();
