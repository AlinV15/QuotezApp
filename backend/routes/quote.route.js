import express from "express";
import { getQuotes, createQuote, updateQuote, deleteQuote, getQuote } from "../controllers/quote.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const quoteRoutes = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = "./uploads/quotes";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/quotes/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        // Use original extension instead of hardcoding .jpg
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Please upload an image"), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB
    },
    fileFilter: fileFilter
});

//get all files in the uploads directory

quoteRoutes.get('/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    res.sendFile(filePath);
});


// GET all quotes
quoteRoutes.get("/", getQuotes);

// POST a new quote
quoteRoutes.post("/", upload.single('authorImage'), createQuote); // Fix: Added missing upload middleware

// PUT update a quote
quoteRoutes.put("/:id", upload.single('authorImage'), updateQuote);

// DELETE a quote
quoteRoutes.delete("/:id", deleteQuote);

// GET a single quote by ID
quoteRoutes.get("/:id", getQuote);

export default quoteRoutes;