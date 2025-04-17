import { Schema } from "mongoose";

export interface IProfile {
    user: Schema.Types.ObjectId; 
    about?: string; 
    phone?: string; 
    city?: string;
    postalAddress?: string;
}
