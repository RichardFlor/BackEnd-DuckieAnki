// controllers/userController.js
const User = require("../models/userModel");

const userController = {
  // Criar Usuário (Create)
  createUser: (req, res) => {
    try {
      const newUser = {
        nome: req.body.nome,
        email: req.body.email,
        password: req.body.password,
      };

      User.create(newUser, (err, result) => {
        if (err) {
          throw err;
        }
        res.status(201).json({ id: result.insertId, ...newUser });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Buscar usuário por ID (Read)
  getUser: (req, res) => {
    try {
      const UserID = req.user.id;

      User.findById(UserID, (err, result) => {
        if (err) {
          throw err;
        }
        if (result.length === 0) {
          return res.status(404).json({ message: "Usuário não encontrado." });
        }
        res.json(result[0]);
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Buscar todos os usuários (Read)
  getAllUsers: (req, res) => {
    try {
      User.findAll((err, results) => {
        if (err) {
          throw err;
        }
        res.json(results);
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Alterar os dados (Update)
  updateUser: (req, res) => {
    try {
      const updatedUser = {};

      if (req.body.nome) {
        updatedUser.nome = req.body.nome;
      }

      if (req.body.email) {
        updatedUser.email = req.body.email;
      }

      if (req.body.password) {
        updatedUser.password = req.body.password;
      }

      const UserId = req.user.id;
      User.update(UserId, updatedUser, (err, result) => {
        if (err) {
          throw err;
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Usuário não encontrado" });
        }
        res.json({ id: UserId, ...updatedUser });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Deletar usuário (Delete)
  deleteUser: (req, res) => {
    try {
      const UserId = req.user.id;
      User.delete(UserId, (err, result) => {
        if (err) {
          throw err;
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Usuário não encontrado" });
        }
        res.status(204).end();
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = userController;
