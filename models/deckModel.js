const db = require("../config/database");

class DeckModel {
  // Criar Deck (Create)
  // Insere novos decks para um usuário específico no banco de dados.
  static insertDecks(userId, decks, callback) {
    const { Decks } = decks.UserDecks;

    Decks.forEach((deck) => {
      const { deckId, deckTitle, questions } = deck;

      const deckQuery = "INSERT INTO Decks (deckTitle, userId) VALUES (?, ?)";
      db.query(deckQuery, [deckTitle, userId], (err, result) => {
        if (err) return callback(err);

        const insertedDeckId = result.insertId;

        questions.forEach((question) => {
          const { question: questionText, responses, correctAnswer } = question;

          const questionQuery =
            "INSERT INTO Questions (deckId, question, correctAnswer) VALUES (?, ?, ?)";
          db.query(
            questionQuery,
            [insertedDeckId, questionText, correctAnswer],
            (err, result) => {
              if (err) return callback(err);

              const questionId = result.insertId;

              responses.forEach((response) => {
                const responseQuery =
                  "INSERT INTO Responses (questionId, response) VALUES (?, ?)";
                db.query(
                  responseQuery,
                  [questionId, response],
                  (err, result) => {
                    if (err) return callback(err);
                  }
                );
              });
            }
          );
        });
      });
    });

    callback(null, { message: "Decks inserted successfully" });
  }

  // Listar Todos os Decks de um Usuário (Read)
  // Obtém todos os decks de um usuário específico com detalhes.
  static listUserDecks(userId, callback) {
    const deckQuery = "SELECT deckId, deckTitle FROM Decks WHERE userId = ?";

    db.query(deckQuery, [userId], (err, decks) => {
      if (err) return callback(err);

      if (decks.length === 0) {
        return callback(null, { message: "No decks found for this user." });
      }

      const deckIds = decks.map((deck) => deck.deckId);
      const questionsQuery = "SELECT * FROM Questions WHERE deckId IN (?)";

      db.query(questionsQuery, [deckIds], (err, questions) => {
        if (err) return callback(err);

        const responsesQuery =
          "SELECT * FROM Responses WHERE questionId IN (?)";
        const questionIds = questions.map((question) => question.questionId);

        db.query(responsesQuery, [questionIds], (err, responses) => {
          if (err) return callback(err);

          const decksWithDetails = decks.map((deck) => {
            const deckQuestions = questions
              .filter((q) => q.deckId === deck.deckId)
              .map((question) => {
                const questionResponses = responses.filter(
                  (r) => r.questionId === question.questionId
                );
                return {
                  ...question,
                  responses: questionResponses,
                };
              });
            return {
              ...deck,
              questions: deckQuestions,
            };
          });

          callback(null, decksWithDetails);
        });
      });
    });
  }

  // Listar um Resumo dos Decks de um Usuário (Read)
  // Obtém um resumo dos decks de um usuário específico com contagem de perguntas.
  static listUserDecksSummary(userId, callback) {
    const deckQuery = `
    SELECT D.deckId, D.deckTitle, COUNT(Q.questionId) AS questionCount
    FROM Decks D
    LEFT JOIN Questions Q ON D.deckId = Q.deckId
    WHERE D.userId = ?
    GROUP BY D.deckId, D.deckTitle
  `;

    db.query(deckQuery, [userId], (err, results) => {
      if (err) return callback(err);

      callback(null, results);
    });
  }

  // Buscar Deck pelo Título (Read)
  // Obtém um deck específico pelo título para um usuário.
  static getDeckByTitle(userId, deckTitle, callback) {
    const deckQuery =
      "SELECT deckId, deckTitle FROM Decks WHERE userId = ? AND deckTitle = ?";

    db.query(deckQuery, [userId, deckTitle], (err, decks) => {
      if (err) return callback(err);

      if (decks.length === 0) {
        return callback(null, {
          message: "No deck found with this title for this user.",
        });
      }

      const deckId = decks[0].deckId;
      const questionsQuery = "SELECT * FROM Questions WHERE deckId = ?";

      db.query(questionsQuery, [deckId], (err, questions) => {
        if (err) return callback(err);

        const questionIds = questions.map((question) => question.questionId);
        const responsesQuery =
          "SELECT * FROM Responses WHERE questionId IN (?)";

        db.query(responsesQuery, [questionIds], (err, responses) => {
          if (err) return callback(err);

          const deckWithDetails = {
            deckId: decks[0].deckId,
            deckTitle: decks[0].deckTitle,
            questions: questions.map((question) => {
              const questionResponses = responses.filter(
                (r) => r.questionId === question.questionId
              );
              return {
                ...question,
                responses: questionResponses,
              };
            }),
          };

          callback(null, deckWithDetails);
        });
      });
    });
  }
  static getDeckById(userId, deckId, callback) {
    const deckQuery =
      "SELECT deckId, deckTitle FROM Decks WHERE userId = ? AND deckId = ?";

    db.query(deckQuery, [userId, deckId], (err, decks) => {
      if (err) return callback(err);

      if (decks.length === 0) {
        return callback(null, {
          message: "No deck found with this ID for this user.",
        });
      }

      const questionsQuery = "SELECT * FROM Questions WHERE deckId = ?";

      db.query(questionsQuery, [deckId], (err, questions) => {
        if (err) return callback(err);

        const questionIds = questions.map((question) => question.questionId);
        const responsesQuery =
          "SELECT * FROM Responses WHERE questionId IN (?)";

        db.query(responsesQuery, [questionIds], (err, responses) => {
          if (err) return callback(err);

          const deckWithDetails = {
            deckId: decks[0].deckId,
            deckTitle: decks[0].deckTitle,
            questions: questions.map((question) => {
              const questionResponses = responses.filter(
                (r) => r.questionId === question.questionId
              );
              return {
                ...question,
                responses: questionResponses,
              };
            }),
          };

          callback(null, deckWithDetails);
        });
      });
    });
  }
  // Deletar Deck (Delete)
  // Deleta um deck específico e suas perguntas e respostas associadas para um usuário.
  static deleteDeck(userId, deckId, callback) {
    const deleteResponsesQuery = `
      DELETE Responses
      FROM Responses
      INNER JOIN Questions ON Responses.questionId = Questions.questionId
      WHERE Questions.deckId = ?;
    `;

    db.query(deleteResponsesQuery, [deckId], (err) => {
      if (err) return callback(err);

      // Apague as perguntas relacionadas ao deck
      const deleteQuestionsQuery = `
        DELETE FROM Questions WHERE deckId = ?;
      `;

      db.query(deleteQuestionsQuery, [deckId], (err) => {
        if (err) return callback(err);

        // Finalmente, apague o deck
        const deleteDeckQuery = `
          DELETE FROM Decks WHERE deckId = ? AND userId = ?;
        `;

        db.query(deleteDeckQuery, [deckId, userId], (err, result) => {
          if (err) return callback(err);

          if (result.affectedRows === 0) {
            return callback(null, {
              message: "No deck found with this ID for this user.",
            });
          }

          callback(null, { message: "Deck deleted successfully" });
        });
      });
    });
  }
}

module.exports = DeckModel;
