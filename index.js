import app from "./src/app.js";
import { env } from "./src/config/env.js";
import connectDB from "./src/database/mongodb.js";

await connectDB();

app.listen(env.PORT, () => {
  console.log(`✅ Server is running on the http://localhost:${env.PORT}`);
});
