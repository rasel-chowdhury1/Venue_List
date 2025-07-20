import { Schema } from "mongoose";

export interface IProfile {
    user: Schema.Types.ObjectId; 
    about?: string; 
    city?: string;
    postalAddress?: string;
    postalCode?: string;
}
