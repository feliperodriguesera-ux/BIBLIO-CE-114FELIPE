//importa o bcrypt para criptografar e comparar senhas
const bcrypt = require("bcrypt");

//Importa o jsonwebtoken para gerar token de login
const jwt = require("jsonwebtoken");

//importa o model de autenticacao
const AuthModel = require("../models/AuthModel");

//Chave usada para assinar o token
const JWT_SECRET = process.env.JWT_SECRET || "segredo_simples";

class AuthController {
  //le o body da requisicao
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

  //Valida os dados de cadastro
  validarCadastro({ nome, email, senha }) {
    if (!nome || !String(nome).trim()) {
      return "Informe o nome.";
    }

    if (!email || !String(email).trim()) {
      return "Informe o email.";
    }

    if (!senha || String(senha).length < 6) {
      return "A senha precisa ter pelo menos 6 caracteres.";
    }

    return null;
  }

  //valida os dados de login
  validarLogin({ email, senha }) {
    if (!email || !String(email).trim()) {
      return "Informe o email.";
    }

    if (!senha || !String(senha).trim()) {
      return "Informe a senha.";
    }

    return null;
  }

  // Cadastra um novo usuario
  async cadastrar(req, res) {
    try {
      const body = this.lerBody(req.body);
      const nome = String(body.nome || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const senha = String(body.senha || "");

      const erroValidacao = this.validarCadastro({ nome, email, senha });

      if (erroValidacao) {
        return res.status(400).json({ erro: erroValidacao });
      }

      const usuarioExistente = await AuthModel.buscarPorEmail(email);

      if (usuarioExistente) {
        return res.status(400).json({ erro: "Esse email ja esta cadastrado." });
      }

      // criptografa a senha antes de salvar no banco
      const senhaCriptografada = await bcrypt.hash(senha, 10);

      const id = await AuthModel.criar({
        nome,
        email,
        senha: senhaCriptografada,
      });

      return res.status(201).json({
        mensagem: "Usuario cadastrado com sucesso.",
        id,
      });
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  }

  // Faz login e devolve um token
  async login(req, res) {
    try {
      const body = this.lerBody(req.body);
      const email = String(body.email || "").trim().toLowerCase();
      const senha = String(body.senha || "");

      const erroValidacao = this.validarLogin({ email, senha });

      if (erroValidacao) {
        return res.status(400).json({ erro: erroValidacao });
      }

      const usuario = await AuthModel.buscarPorEmail(email);

      if (!usuario) {
        return res.status(401).json({ erro: "Email ou senha invalidos." });
      }

      // compara a senha digitada com a senha criptografada do banco
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ erro: "Email ou senha invalidos." });
      }

      // Gera o token com id e email do usuario
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        mensagem: "Login realizado com sucesso.",
        token,
      });
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  }

  // retorna os dados do usuario autenticado
  async perfil(req, res) {
    try {
      const usuario = await AuthModel.buscarPorId(req.usuario.id);

      if (!usuario) {
        return res.status(404).json({ erro: "Usuario nao encontrado." });
      }

      return res.json(usuario);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  }

  //lista todos os usuarios cadastrados
  //URL: http://localhost:3000/api/auth/usuarios
  async listarUsuarios(_req, res) {
    try {
      const usuarios = await AuthModel.listarTodos();

      if (!usuarios.length) {
        return res.json({ mensagem: "Nenhum usuario cadastrado" });
      }

      return res.json(usuarios);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  }

  //busca um usuario pelo id
  //URL: http://localhost:3000/api/auth/usuarios/1
  async buscarUsuarioPorId(req, res) {
    try {
      const usuario = await AuthModel.buscarPorId(Number(req.params.id));

      if (!usuario) {
        return res.status(404).json({ erro: "Usuario nao encontrado." });
      }

      return res.json(usuario);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  }
}

module.exports = new AuthController();
