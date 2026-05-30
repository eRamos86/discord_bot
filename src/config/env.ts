// src/config/env.ts

import dotenv from "dotenv";

dotenv.config();

export const ENV = {
    TOKEN: process.env.TOKEN!,
    OWNER_1: process.env.OWNER_1!,
    OWNER_2: process.env.OWNER_2!,
    OWNER_3: process.env.OWNER_3!,
};