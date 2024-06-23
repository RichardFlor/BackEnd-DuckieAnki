const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const authController = {
  register: (req, res) => {
    const newUser = {
      nome: req.body.nome,
      email: req.body.email,
      password: req.body.password,
    };

    User.create(newUser, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Generate a token after successful registration
      const token = jwt.sign(
        { id: result.insertId, email: newUser.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.status(201).json({ message: "Usuário registrado com sucesso.", token });
    });
  },

  login: (req, res) => {
    const { email, password } = req.body;

    User.findByEmail(email, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = result[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        res.json({ token });
      });
    });
  },
};

module.exports = authController;