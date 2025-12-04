import { promises as fs } from "fs";
import { join } from "path";
import { User } from "../types/data.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

type ID = string;

interface DBSchema {
    users: User[];
}

const DB_PATH = join(__dirname, "../../user.json");

async function ensureDB(): Promise<DBSchema> {
    try {
        const raw = await fs.readFile(DB_PATH, "utf8");
        const parsed: DBSchema = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.users)) throw new Error("Invalid DB shape");
        return parsed;
    } catch (err) {
        // create a fresh DB if file missing or invalid
        const init: DBSchema = { users: [] };
        await writeDB(init);
        return init;
    }
}

async function writeDB(db: DBSchema): Promise<void> {
    // atomic write: write to temp file then rename
    const tmp = `${DB_PATH}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, DB_PATH);
}

function generateId(): ID {
    // Use crypto.randomUUID if available, fallback to timestamp + random
    try {
        // @ts-ignore
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            // Node 14.17+ and browsers
            // @ts-ignore
            return crypto.randomUUID();
        }
    } catch { }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export default class UserModel {
    // return all users
    static async all(): Promise<User[]> {
        const db = await ensureDB();
        return db.users.slice();
    }

    // find one by id
    static async findById(id: ID): Promise<User | null> {
        const db = await ensureDB();
        const u = db.users.find((x) => x.id === id);
        return u ? { ...u } : null;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const db = await ensureDB();
        const user = db.users.find((u) => u.email === email) || null;
        return user ? { ...user } : null;
    }

    static async _hashThePassword(password: string): Promise<string> {
        const hashedPass = await bcrypt.hash(password, 10);
        return hashedPass;
    }

    static async _comaparePassword({ dbPassword, userPassed }: { dbPassword: string, userPassed: string }): Promise<boolean> {
        const valid: boolean = await bcrypt.compare(userPassed, dbPassword);
        return valid;
    }

    static async generateToken(data: any): Promise<string> {
        const token = jwt.sign(data, process.env.JWT_SECRETE!, { expiresIn: "1d" });
        return token;
    }

    // create a new user (save)
    static async create(payload: Partial<User>): Promise<User> {
        const db = await ensureDB();
        const now = new Date();
        const user: User = {
            id: generateId(),
            createdAt: now,
            updatedAt: now,
            name: payload.name ?? "",
            password: payload.password ?? "",
            email: payload.email ?? "",
            events: [""],
            createdEvents: [],
            participatedEvents: []
        };
        db.users.push(user);
        await writeDB(db);
        return { ...user };
    }

    // update by id (partial update)
    static async update(id: ID, patch: Partial<User>): Promise<User | null> {
        const db = await ensureDB();
        const idx = db.users.findIndex((x) => x.id === id);
        if (idx === -1) return null;
        const existing = db.users[idx];
        const updated: User = {
            ...existing,
            ...patch,
            id: existing.id, // ensure id not changed
            updatedAt: new Date()
        };
        db.users[idx] = updated;
        await writeDB(db);
        return { ...updated };
    }

    // delete by id
    static async delete(id: ID): Promise<boolean> {
        const db = await ensureDB();
        const idx = db.users.findIndex((x) => x.id === id);
        if (idx === -1) return false;
        db.users.splice(idx, 1);
        await writeDB(db);
        return true;
    }

    // helper: replace entire DB (useful for tests)
    static async replaceAll(users: User[]): Promise<void> {
        const db: DBSchema = { users: users.map((u) => ({ ...u })) };
        await writeDB(db);
    }

    static async addCreatedEvent(userId: string, eventId: string): Promise<void> {
        const db = await ensureDB();
        const userIndex = db.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
            const user = db.users[userIndex];
            if (!user.createdEvents) user.createdEvents = [];
            user.createdEvents.push(eventId);
            db.users[userIndex] = user;
            await writeDB(db);
        }
    }

    static async addParticipatedEvent(userId: string, eventId: string): Promise<void> {
        const db = await ensureDB();
        const userIndex = db.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
            const user = db.users[userIndex];
            if (!user.participatedEvents) user.participatedEvents = [];
            if (!user.participatedEvents.includes(eventId)) {
                user.participatedEvents.push(eventId);
                db.users[userIndex] = user;
                await writeDB(db);
            }
        }
    }
}