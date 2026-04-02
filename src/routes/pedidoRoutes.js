// Importa o Express
const express = require("express");

// Importa o controller de pedidos
const PedidoController = require("../controllers/PedidoController");

// Importa o middleware que valida o token
const autenticarToken = require("../middlewares/authMiddleware");

// Cria o router das rotas de pedidos
const router = express.Router();

// TOKEN OBRIGATORIO
// Todas as rotas de pedidos exigem login
// No Postman envie no header:
// Authorization: Bearer SEU_TOKEN
router.use(autenticarToken);

// POSTMAN
// GET http://localhost:3000/api/pedidos
// usar para listar todos os pedidos
// precisa enviar token
router.get("/", PedidoController.listar.bind(PedidoController));

// POSTMAN
// GET http://localhost:3000/api/pedidos/1
// usar para buscar um pedido pelo id
// precisa enviar token
router.get("/:id", PedidoController.buscarPorId.bind(PedidoController));

// POSTMAN
// POST http://localhost:3000/api/pedidos
// usar para cadastrar um novo pedido
// voce nao precisa informar o nome do produto
// o sistema busca cada produto pelo produto_id automaticamente
// agora um pedido pode ter varios produtos de uma vez
// body exemplo:
// {
//   "itens": [
//     { "produto_id": 1, "quantidade": 2 },
//     { "produto_id": 2, "quantidade": 1 }
//   ]
// }
// precisa enviar token
router.post("/", PedidoController.cadastrar.bind(PedidoController));

// POSTMAN
// DELETE http://localhost:3000/api/pedidos/1
// usar para deletar um pedido
// precisa enviar token
router.delete("/:id", PedidoController.deletar.bind(PedidoController));

// Exporta o router de pedidos
module.exports = router;
