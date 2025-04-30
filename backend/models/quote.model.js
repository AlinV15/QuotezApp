import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
    quote: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

const Quote = mongoose.model("Quote", quoteSchema);

export default Quote;
