import app, { connectDB } from "../server/app.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({
      success: false,
      message: "Serverless execution error: " + (error.message || "Internal Error"),
    });
  }
}
