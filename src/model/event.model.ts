import { promises as fs } from "fs";
import { join } from "path";
import dotenv from 'dotenv';
import { Event } from "../types/data.model";




dotenv.config()


type ID = string;


interface DBSchema {
    Events: Event[];
}

const DB_PATH = join(__dirname, "../../db.json");

async function ensureDB(): Promise<DBSchema> {
    try {
        const raw = await fs.readFile(DB_PATH, "utf8");
        const parsed: DBSchema = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.Events)) throw new Error("Invalid DB shape");
        return parsed;
    } catch (err) {
        // create a fresh DB if file missing or invalid
        const init: DBSchema = { Events: [] };
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

async function generateId(): Promise<ID> {
    // Use crypto.randomUUID if available, fallback to timestamp + random
    try {
        // @ts-ignore
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            // Node 14.17+ and browsers
            // @ts-ignore
            return crypto.randomUUID();
        }
    } catch {}
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export default class EventModel {
    // return all events
    static async all(): Promise<Event[]> {
        const db = await ensureDB();
        return db.Events.slice();
    }

    // find event by id
    static async findById(id: ID): Promise<Event | null> {
        const db = await ensureDB();
        const event = db.Events.find((e) => e.id === id);
        return event || null;
    }

    // create a new event
    static async create(eventData: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event> {
        const db = await ensureDB();
        const newEvent: Event = {
            id: await generateId(),
            ...eventData,
            createdAt: new Date(),
            updatedAt: new Date()
        };  
        db.Events.push(newEvent);
        await writeDB(db);
        return newEvent;
    }   


    // update an existing event
    static async update(id: ID, updateData: Partial<Omit<Event, "id" | "createdAt" | "updatedAt">>): Promise<Event | null> {
        const db = await ensureDB();
        const eventIndex = db.Events.findIndex((e) => e.id === id);
        if (eventIndex === -1) return null;
        const updatedEvent = {
            ...db.Events[eventIndex],
            ...updateData,
            updatedAt: new Date()
        };
        db.Events[eventIndex] = updatedEvent;
        await writeDB(db);
        return updatedEvent;
    }

    // delete an event
    static async delete(id: ID): Promise<boolean> {
        const db = await ensureDB();
        const initialLength = db.Events.length;
        db.Events = db.Events.filter((e) => e.id !== id);
        if (db.Events.length === initialLength) return false; // no event deleted
        await writeDB(db);
        return true;
    }

}