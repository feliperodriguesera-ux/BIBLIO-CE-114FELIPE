const express = require("express");
const cors = require("cors");

const produtoRoutes = require("./src/routes/produtoRoutes");
const authRoutes = require("./src/routes/authRoutes");
const ProdutoModel = require("./src/models/ProdutoModel");
const AuthModel = require("./src/models/AuthModel");

const app = express();
const PORTA = Number(process.env.PORT) || 3000;

// Habilita o acesso da API por outros programas, como Postman e frontend.
app.use(cors());

// Permite que o Express entenda JSON enviado no corpo da requisicao.
app.use(express.json());
app.use(express.text({ type: "text/plain" }));


app.get("/", (_req, res) => {
  res.json({
    mensagem: "API da papelaria funcionando.",
    modulo_produtos: "/api/produtos",
    modulo_auth: "/api/auth",
  });
});

// A API agora expoe apenas o modulo de produtos.
app.use("/api/produtos", produtoRoutes);
app.use("/api/auth", authRoutes);

// Retorno padrao para qualquer rota inexistente.
app.use((req, res) => {
  res.status(404).json({
    erro: `Rota ${req.method} ${req.originalUrl} nao encontrada.`,
  });
});

// Tratamento central para erros inesperados.
app.use((erro, _req, res, _next) => {
  console.error("Erro inesperado:", erro);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

async function iniciarServidor() {
  try {
    // Antes de subir a API, garantimos que a estrutura de produtos exista.
    await ProdutoModel.garantirEstrutura();
    await AuthModel.garantirEstrutura();

    app.listen(PORTA, () => {
      console.log(`Servidor rodando em http://localhost:${PORTA}`);
      console.log("API pronta para testes no Postman.");
    });
  } catch (erro) {
    console.error("Falha ao iniciar o servidor:", erro.message);
  }
}

if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
