// routes/userRoutes.js
const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const dotenv = require("dotenv");
dotenv.config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY);

const router = express.Router();

// ChatBot
router.post("/chatbot", async (req, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-latest" });
  const chat = model.startChat({
    history: req.body.history,
  });
  const msg = req.body.message;

  try {
    let text = "";
    const result = await chat.sendMessageStream(msg);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
      text += chunkText;
    }
    res.send(text);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong!");
  }
});

router.post("/createDeck", async (req, res) => {
  const { chatHistory, numQuestions, numAnswers } = req.body;

  if (!chatHistory || chatHistory.length === 0) {
    return res.status(400).send("No chat history provided.");
  }

  const lastModelMessage = chatHistory
    .filter((item) => item.role === "model")
    .pop();

  if (!lastModelMessage) {
    return res.status(400).send("No model messages found in chat history.");
  }

  const prompt = ` Usando esse texto: "${lastModelMessage.parts[0].text}", crie ${numQuestions} perguntas e cada pergunta deve ter ${numAnswers} questões, mas apenas um deve ser correta. Retorne sempre as perguntas e a resposta junto.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-latest" });
    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = await response.text();

    res.send(text);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong!");
  }
});


router.post("/sendDeck", async (req, res) => {
    const { titleDeck, chatHistory, token } = req.body;
  
    if (!chatHistory || chatHistory.length === 0) {
      return res.status(400).send("No chat history provided.");
    }
  
    const lastModelMessage = chatHistory
      .filter((item) => item.role === "model")
      .pop();
  
    if (!lastModelMessage) {
      return res.status(400).send("No model messages found in chat history.");
    }
  
    const prompt = `A partir de: "${lastModelMessage.parts[0].text}", formate desse forma: {\n   \"questions\":[\n      {\n         \"question\":\"Pergunta\",\n         \"responses\":[\n            \"\",\n            \"\",\n            \"\",\n            \"\"\n         ],\n         \"correctAnswer\":0\n      }\n   ]\n}`;
  
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-latest" });
      const chat = model.startChat({
        history: chatHistory,
      });
  
      const result = await chat.sendMessage(prompt);
      const response = result.response;
      let text = await response.text();
  
      // Log do texto recebido para depuração
      console.log("Original text from /format:", text);
  
      // Tentar corrigir o JSON se não for válido
      let formattedData;
      try {
        formattedData = JSON.parse(text);
      } catch (error) {
        console.error("Invalid JSON, attempting to fix...");
  
        // Corrigir chaves sem aspas
        text = text.replace(/(\w+):/g, '"$1":');
  
        // Corrigir aspas desbalanceadas
        const matches = text.match(/"/g);
        if (matches && matches.length % 2 !== 0) {
          text = text.replace(/"([^"]*)$/, '$1');
        }
  
        // Remover caracteres inválidos antes do JSON
        text = text.replace(/^[^{[]+/, '');
  
        // Remover caracteres inválidos depois do JSON
        text = text.replace(/[^}\]]+$/, '');
  
        try {
          formattedData = JSON.parse(text);
        } catch (innerError) {
          console.error("Failed to fix JSON:", innerError);
          return res.status(500).send("Formato do JSON inválido.");
        }
      }
  
      // Verificar se o JSON formatado contém 'questions'
      if (!formattedData.questions) {
        console.error("Formatted data does not contain 'questions'");
        return res
          .status(400)
          .send("Formatted data does not contain 'questions'");
      }
  
      // Construa o objeto para enviar para '/deck/create'
      const deckData = {
        "UserDecks": {
          "Decks": [
            {
              "deckTitle": `"${titleDeck}"`, // Removendo as aspas aqui
              "questions": formattedData.questions, // Adiciona os dados formatados diretamente aqui
            },
          ],
        },
      };
  
      // Log do objeto deckData para depuração
      console.log(
        "Deck data being sent to /deck/create:",
        JSON.stringify(deckData)
      );
  
      // Chame a rota '/deck/create' com os dados formatados
      const deckCreateResponse = await fetch(
        "http://localhost:8080/deck/create",
        {
          method: "POST",
          body: JSON.stringify(deckData),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho da requisição
          },
        }
      );
  
      // Verifique o status da resposta do '/deck/create'
      if (deckCreateResponse.ok) {
        // Se a resposta for bem-sucedida, envie a resposta do '/deck/create' de volta ao cliente
        const deckCreateData = await deckCreateResponse.json();
        res.json(deckCreateData);
      } else {
        // Se houver um erro, envie uma mensagem de erro para o cliente
        const errorText = await deckCreateResponse.text();
        console.error("Error from /deck/create:", errorText);
        throw new Error("Failed to create deck.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong!");
    }
  });

module.exports = router;
