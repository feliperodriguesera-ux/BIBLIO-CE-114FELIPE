// Importa o Express.
const express = require("express");

// Importa o controller de autenticacao.
const AuthController = require("../controllers/AuthController");

// Importa o middleware que valida o token.
const autenticarToken = require("../middlewares/authMiddleware");

// Cria o router das rotas de autenticacao.
const router = express.Router();

// no postman, usar a rota http://localhost:3000/api/auth/cadastro para cadastrar um novo usuario
// usar para cadastrar um novo usuario
router.post("/cadastro", AuthController.cadastrar.bind(AuthController));

// no postman, usar a rota http://localhost:3000/api/auth/login para fazer login e receber o token
// usar para fazer login e receber o token
router.post("/login", AuthController.login.bind(AuthController));

// no postman, usar a rota http://localhost:3000/api/auth/usuarios
// usar para listar todos os usuarios cadastrados
router.get("/usuarios", AuthController.listarUsuarios.bind(AuthController));

// neste o postman, usar a rota http://localhost:3000/api/auth/usuarios/1
// usar para buscar um usuario pelo id
router.get("/usuarios/:id", AuthController.buscarUsuarioPorId.bind(AuthController));

// no postman, usar a rota http://localhost:3000/api/auth/perfil
// usar para ver os dados do usuario logado
// nesta rota voce precisa enviar o token no header Authorization
// exemplo: Bearer SEU_TOKEN
router.get("/perfil", autenticarToken, AuthController.perfil.bind(AuthController));

module.exports = router;
