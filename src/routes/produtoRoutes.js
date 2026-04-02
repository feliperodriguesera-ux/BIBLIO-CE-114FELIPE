// Importa o Express.
// O Express e a biblioteca usada para criar as rotas da API.
const express = require("express");

// Importa o controller de produtos.
// O controller contem a logica de listar, buscar, cadastrar, atualizar e deletar.
const ProdutoController = require("../controllers/ProdutoController");

// Importa o middleware que valida o token.
const autenticarToken = require("../middlewares/authMiddleware");

// Cria um objeto router.
// Esse router serve para organizar as rotas do modulo de produtos.
const router = express.Router();

//  TOKEN OBRIGATORIO 
// Todas as rotas de produtos abaixo exigem login
// No Postman envie no header:
// Authorization: Bearer SEU_TOKEN
router.use(autenticarToken);

//POSTMAN
// GET http://localhost:3000/api/produtos
// usar para listar todos os produtos
// precisa enviar token
router.get("/", ProdutoController.listar.bind(ProdutoController));

//  POSTMAN
// GET http://localhost:3000/api/produtos/1
// usar para buscar um produto pelo id
// precisa enviar token
router.get("/:id", ProdutoController.buscarPorId.bind(ProdutoController));

// POSTMAN 
// POST http://localhost:3000/api/produtos
// usar para cadastrar um novo produto
// precisa enviar token
router.post("/", ProdutoController.cadastrar.bind(ProdutoController));

// POSTMAN 
// PUT http://localhost:3000/api/produtos/1
// usar para atualizar um produto existente
// precisa enviar token
router.put("/:id", ProdutoController.atualizar.bind(ProdutoController));

// POSTMAN 
// DELETE http://localhost:3000/api/produtos/1
// usar para deletar um produto pelo id
// precisa enviar token
router.delete("/:id", ProdutoController.deletar.bind(ProdutoController));

// Exporta o router para que ele possa ser usado no server.js.
module.exports = router;
