import mongoose, { Schema, Document } from "mongoose";

interface IPage {
    url: string;
    isActive: boolean;
}

export interface IUserPages extends Document {
    userId: string;
    pages: IPage[];
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean
}

const CrawlerPageSchema = new Schema<IPage>(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false } // prevents creating _id for each page
);

const CrawlerSchema = new Schema<IUserPages>(
    {
        userId: {
            type: String,
            required: true,
            index: true, // fast queries per user
        },
        pages: {
            type: [CrawlerPageSchema],
            default: [],
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
    }
);

export default mongoose.model<IUserPages>(
    "Crawler",
    CrawlerSchema
);