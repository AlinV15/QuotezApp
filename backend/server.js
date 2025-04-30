import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import path from "path";

import quoteRoutes from "./routes/quote.route.js";



const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

//const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

const __dirname = path.resolve(); // Get the current directory name
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the uploads directory

// Connect to MongoDB
connectDB();

// Define routes
app.use("/api/quotes", quoteRoutes);



app.get("/", (req, res) => {
    res.send("Server runs!");
}
);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});

