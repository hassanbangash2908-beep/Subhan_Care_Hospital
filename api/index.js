import app, { connectDB } from "../server/app.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("Vercel handler error:", err);
    return res.status(500).json({ success: false, message: err.message || "Serverless Error" });
  }
}
