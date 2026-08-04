import dotenv from "dotenv";
import { app } from "./app";

dotenv.config();

// ==================== SERVIDOR ====================
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
