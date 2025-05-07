// quote.controller.js - ajustat pentru a folosi câmpul 'image'
import Quote from '../models/quote.model.js';
import mongoose from 'mongoose';
import { z } from 'zod';

const quoteSchema = z.object({
    quote: z.string({
        required_error: "Quote text is required"
    }).min(5, "Quote cannot be less than 5 characters"),
    author: z.string({
        required_error: "Author is required"
    }).min(2, "Author cannot have less than 2 characters")

})

const quoteIdSchema = z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid quote ID format"
    })
});

//middleware functions
const validateRequest = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next()
    } catch (error) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.errors || error.message
        });
    }
}

const validateId = (req, res, next) => {
    try {
        quoteIdSchema.parse({ id: req.params.id })
        next();
    } catch (error) {
        return res.status(400).json({
            message: "Invalid ID format",
            errors: error.errors || error.message
        });
    }
}

export const getQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find({});
        res.status(200).json(quotes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const createQuote = [
    validateRequest(quoteSchema),
    async (req, res) => {
        try {
            console.log("Body primit:", req.body);
            console.log("File primit:", req.file);

            const { quote, author } = req.body;

            // Construim calea imaginii pentru câmpul 'image'
            const imagePath = req.file ? `/uploads/quotes/${req.file.filename}` : null;
            console.log("Calea imaginii construită:", imagePath);

            const newQuote = new Quote({
                quote,
                author,
                image: imagePath  // Folosim 'image' în loc de 'authorImage'
            });

            const savedQuote = await newQuote.save();
            console.log("Citat salvat:", savedQuote);

            res.status(201).json(savedQuote);
        } catch (error) {
            console.error("Eroare la creare citat:", error);
            res.status(409).json({ message: error.message });
        }
    }
];

export const updateQuote = [
    validateId,
    validateRequest(quoteSchema.partial()),
    async (req, res) => {
        try {
            // req.file va conține imaginea încărcată dacă folosești multer
            const updatedData = {
                quote: req.body.quote,
                author: req.body.author
            };

            // Dacă există o imagine nouă, actualizează calea
            if (req.file) {
                updatedData.image = `/uploads/quotes/${req.file.filename}`;
            }

            const updatedQuote = await Quote.findByIdAndUpdate(
                req.params.id,
                updatedData,
                { new: true }
            );

            res.json(updatedQuote);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
]

export const deleteQuote = [
    validateId,
    async (req, res) => {
        try {
            const { id } = req.params;
            console.log('ID pentru ștergere:', id);

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(404).send('No quote with that id');
            }

            await Quote.findByIdAndDelete(id);
            res.json({ message: 'Quote deleted successfully.' });
        } catch (error) {
            console.error('Eroare la ștergere:', error);
            res.status(500).json({ message: error.message });
        }
    }
];

export const getQuote = [
    validateId,
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(404).send('No quote with that id');
            }

            const quote = await Quote.findById(id);

            if (!quote) {
                return res.status(404).send('Quote not found');
            }

            res.json(quote);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
]