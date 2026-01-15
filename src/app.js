import express from "express";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";
import router from "./routes/index.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Auth server");
});

app.use("/api/v1", router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
