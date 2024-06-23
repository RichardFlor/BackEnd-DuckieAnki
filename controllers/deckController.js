const DeckModel = require("../models/deckModel");

// Função para inserir decks
const insertDecks = (userId, decks, callback) => {
  // Substitui espaços por hífens no título do deck
  decks.UserDecks.Decks = decks.UserDecks.Decks.map((deck) => {
    deck.deckTitle = deck.deckTitle.replace(/\s+/g, "-"); // Substitui espaços por hífens no título do deck
    return deck;
  });

  DeckModel.insertDecks(userId, decks, callback); // Chama a função insertDecks do modelo de dados para inserir os decks no banco de dados
};

// Função para listar todos os decks de um usuário
const listUserDecks = (userId, callback) => {
  DeckModel.listUserDecks(userId, callback); // Chama a função listUserDecks do modelo de dados para obter todos os decks de um usuário
};

// Função para listar o resumo dos decks de um usuário
const listUserDecksSummary = (userId, callback) => {
  DeckModel.listUserDecksSummary(userId, callback); // Chama a função listUserDecksSummary do modelo de dados para obter o resumo dos decks de um usuário
};

// Função para obter um deck pelo título
const getDeckByTitle = (userId, deckTitle, callback) => {
  DeckModel.getDeckByTitle(userId, deckTitle, callback); // Chama a função getDeckByTitle do modelo de dados para obter um deck específico pelo título
};

const getDeckById = (userId, deckId, callback) => {
  DeckModel.getDeckById(userId, deckId, callback);
};

// Função para deletar um deck
const deleteDeck = (userId, deckId, callback) => {
  DeckModel.deleteDeck(userId, deckId, callback); // Chama a função deleteDeck do modelo de dados para deletar um deck específico
};

module.exports = {
  insertDecks,
  listUserDecks,
  listUserDecksSummary,
  getDeckByTitle,
  getDeckById,
  deleteDeck,
};
