const express = require("express");
const {
  insertDecks,
  listUserDecks,
  listUserDecksSummary,
  getDeckByTitle,
  getDeckById,
  deleteDeck,
} = require("../controllers/deckController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Criar Deck (Create)
// Rota POST para criar um novo deck. Requer autenticação.
// Recebe os dados do deck no corpo da requisição e o ID do usuário autenticado.
// Chama a função insertDecks para inserir o deck no banco de dados.
router.post("/create", authMiddleware, (req, res) => {
  const userId = req.user.id; // Obtém o ID do usuário autenticado.
  const decks = req.body; // Obtém os dados do deck do corpo da requisição.

  insertDecks(userId, decks, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Retorna erro 500 se houver um erro na inserção.
    }
    res.status(201).json(result); // Retorna o resultado da inserção com status 201.
  });
});

// Listar todos os Decks de um Usuário (Read)
// Rota GET para listar todos os decks de um usuário autenticado.
// Chama a função listUserDecks para obter os decks do banco de dados.
router.get("/list", authMiddleware, (req, res) => {
  const userId = req.user.id; // Obtém o ID do usuário autenticado.

  listUserDecks(userId, (err, decks) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Retorna erro 500 se houver um erro na consulta.
    }
    res.status(200).json(decks); // Retorna a lista de decks com status 200.
  });
});

// Listar um resumo dos Decks de um Usuário (Read)
// Rota GET para obter um resumo dos decks de um usuário autenticado.
// Chama a função listUserDecksSummary para obter o resumo dos decks.
router.get("/summary", authMiddleware, (req, res) => {
  const userId = req.user.id; // Obtém o ID do usuário autenticado.

  listUserDecksSummary(userId, (err, decks) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Retorna erro 500 se houver um erro na consulta.
    }
    res.status(200).json(decks); // Retorna o resumo dos decks com status 200.
  });
});

// Buscar Deck pelo título (Read)
// Rota GET para buscar um deck específico pelo título.
// Chama a função getDeckByTitle para obter o deck correspondente.
router.get("/:title", authMiddleware, (req, res) => {
  const userId = req.user.id; // Obtém o ID do usuário autenticado.
  const deckTitle = req.params.title; // Obtém o título do deck dos parâmetros da URL.

  getDeckByTitle(userId, deckTitle, (err, deck) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Retorna erro 500 se houver um erro na consulta.
    }
    if (deck.message) {
      return res.status(404).json({ error: deck.message }); // Retorna erro 404 se o deck não for encontrado.
    }
    res.status(200).json(deck); // Retorna o deck encontrado com status 200.
  });
});

// Buscar Deck pelo ID (Read)
// Rota GET para buscar um deck específico pelo ID.
// Chama a função getDeckById para obter o deck correspondente.
router.get("/id/:id", authMiddleware, (req, res) => {
  const userId = req.user.id; // Obtém o ID do usuário autenticado.
  const deckId = req.params.id; // Obtém o ID do deck dos parâmetros da URL.

  // Chama a função getDeckById para buscar o deck pelo ID.
  getDeckById(userId, deckId, (err, deck) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Retorna erro 500 se houver um erro na consulta.
    }
    if (deck.message) {
      return res.status(404).json({ error: deck.message }); // Retorna erro 404 se o deck não for encontrado.
    }
    res.status(200).json(deck); // Retorna o deck encontrado com status 200.
  });
});

// Deletar Deck pelo ID (Delete)
// Rota DELETE para deletar um deck específico pelo ID.
// Chama a função deleteDeck para remover o deck do banco de dados.
router.delete("/:id", authMiddleware, (req, res) => {
  const userId = req.user.id; // Obtém o ID do usuário autenticado.
  const deckId = req.params.id; // Obtém o ID do deck dos parâmetros da URL.

  deleteDeck(userId, deckId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Retorna erro 500 se houver um erro na exclusão.
    }
    if (result.message) {
      return res.status(404).json({ error: result.message }); // Retorna erro 404 se o deck não for encontrado.
    }
    res.status(200).json(result); // Retorna o resultado da exclusão com status 200.
  });
});

module.exports = router;
