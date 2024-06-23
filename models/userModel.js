const db = require("../config/database");
const bcrypt = require("bcryptjs");

const User = {
  // Criar Usuário (Create)
  create: (user, callback) => {
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) return callback(err);
      const query =
        "INSERT INTO users (nome, email, password) VALUES ( ?, ?, ?)";
      db.query(query, [user.nome, user.email, hash], callback);
    });
  },
  // Buscar usuário por ID (Read)
  findById: (id, callback) => {
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [id], callback);
  },
  findByEmail: (email, callback) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], callback);
  },
  // Buscar todos os usuários (Read)
  findAll: (callback) => {
    const query = "SELECT * FROM users";
    db.query(query, callback);
  },
  // Alterar os dados (Update)
  update: (id, user, callback) => {
    const fields = [];
    const values = [];
    if (user.nome) {
      fields.push("nome = ?");
      values.push(user.nome);
    }
    if (user.email) {
      fields.push("email = ?");
      values.push(user.email);
    }
    const updatePassword = (callback) => {
      if (user.password) {
        bcrypt.hash(user.password, 10, (err, hash) => {
          if (err) return callback(err);
          fields.push("password = ?");
          values.push(hash);
          callback(null);
        });
      } else {
        callback(null);
      }
    };
    updatePassword((err) => {
      if (err) return callback(err);
      const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
      values.push(id);
      db.query(query, values, callback);
    });
  },
  // Deletar usuário (Delete)
  delete: (id, callback) => {
    const query = "DELETE FROM users WHERE id = ?";
    db.query(query, [id], callback);
  },
};

module.exports = User;
