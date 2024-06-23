const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const deckRoutes = require("./routes/deckRoutes");
const gemRoutes = require("./routes/gemRoutes");
const authMiddleware = require("./middlewares/authMiddleware");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
// Rotas
// Sem autenticação
app.use("/auth", authRoutes);
// Usuário autenticado
app.use("/user", userRoutes);
app.get("/user", authMiddleware, userRoutes, (req, res) => {
  res.status(201).send("sucesso");
});
// Deck
app.use("/deck", deckRoutes);
// Gemini
app.use("/gemini", gemRoutes);
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
