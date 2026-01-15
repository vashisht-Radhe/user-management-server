import app from "./src/app.js";
import { PORT } from "./src/config/env.js";
import connectDB from "./src/database/mongodb.js";

await connectDB();

app.listen(PORT, () => {
  console.log(`✅ Server is running on the http://localhost:${PORT}`);
});
