import app, { connectDB } from "../server/app.js";

connectDB().catch((err) => console.error("Initial DB connect error:", err.message));

export default app;
