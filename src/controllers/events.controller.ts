import { errorLogger } from "../utils/logger";
import { Request, Response } from "express";
import EventModel from "../model/event.model";
import UserModel from "../model/user.model";
import { sendEmail } from "../utils/email";
import { Event } from "../types/data.model";


export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, date, location, description,price,numberOfTickets} = req.body;
    // Here you would typically save the event to the database
    const userId : string = (req as any).userId;
    
    const newEvent: Event = {
        location,
        price,
        numberOfTickets,
        createddBy: userId,
        title,
        description,
        dateOfConduct: new Date(date),
        participants: [""],
        remainingTickets: numberOfTickets,
        
    };
    const createdEvent = await EventModel.create(newEvent)
    
    // Track created event for user
    await UserModel.addCreatedEvent(userId, createdEvent.id!);

    res.status(201).json({ message: "Event created successfully", event: createdEvent });
  } catch (error) {
    errorLogger.error({ error }, "Error creating event");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await EventModel.all();
    res.status(200).json({ events });
  } catch (error) {
    errorLogger.error({ error }, "Error fetching events");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;  
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ event });
  } catch (error) {
    errorLogger.error({ error }, "Error fetching event by ID");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const updates = req.body;
   
    const updatedEvent = await EventModel.update(eventId, updates);
    if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
    errorLogger.error({ error }, "Error updating event");
    res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;  
    
    const success = await EventModel.delete(eventId);
    if (!success) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
    errorLogger.error({ error }, "Error deleting event");
    res.status(500).json({ error: "Internal server error" });
    }
};

export const registerForEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId : string = (req as any).userId;
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (event.remainingTickets <= 0) {
      return res.status(400).json({ error: "No tickets available" });
    }
    if (event.participants && event.participants.includes(userId)) {
      return res.status(400).json({ error: "User already joined the event" });
    }
    // @ts-ignore
    event.participants = event.participants ? [...event.participants, userId] : [userId];
    event.remainingTickets -= 1;
    const updatedEvent = await EventModel.update(eventId, {
      participants: event.participants,
      remainingTickets: event.remainingTickets,
    });

    // Send confirmation email
    // We need user email here. Since we only have userId, we should fetch user details.
    // However, for efficiency, we might want to pass email in token or fetch it.
    // Let's fetch the user to get the email.
    const user = await UserModel.findById(userId);
    if (user) {
        await sendEmail({
            to: user.email,
            subject: "Event Registration Confirmation",
            text: `Hi ${user.name},\n\nYou have successfully registered for the event: ${event.title}.\n\nEvent Details:\nDate: ${new Date(event.dateOfConduct).toDateString()}\nLocation: ${event.location}\n\nSee you there!\nEvent Management Team`
        });
    }

    // Track participated event for user
    await UserModel.addParticipatedEvent(userId, eventId);

    res.status(200).json({ message: "Joined event successfully", event: updatedEvent });
  }
    catch (error) {
    errorLogger.error({ error }, "Error joining event");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventsByUser = async (req: Request, res: Response) => {
  try {
    const userId : string = req.params.userId;
    const allEvents = await EventModel.all();
    const userEvents = allEvents.filter(event => event.createddBy === userId);
    if (!userEvents.length) {
        return res.status(404).json({ error: "No events found for user" });  
    }
    res.status(200).json({ events: userEvents });
  }
    catch (error) {
    errorLogger.error({ error }, "Error fetching events by user");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventsForParticipant = async (req: Request, res: Response) => {
  try {
    const userId : string = req.params.userId;
    const allEvents = await EventModel.all();
    const participantEvents = allEvents.filter(event => event.participants && event.participants.includes(userId));
    if (!participantEvents.length) {
        return res.status(404).json({ error: "No events found for participant" });  
    }
    res.status(200).json({ events: participantEvents });
  }
    catch (error) {
    errorLogger.error({ error }, "Error fetching events for participant");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCreatedEvents = async (req: Request, res: Response) => {
    try {
        const userId: string = (req as any).userId;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const createdEventIds = user.createdEvents || [];
        const allEvents = await EventModel.all();
        const createdEvents = allEvents.filter(event => event.id && createdEventIds.includes(event.id));
        
        res.status(200).json({ events: createdEvents });
    } catch (error) {
        errorLogger.error({ error }, "Error fetching created events");
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getRegisteredEvents = async (req: Request, res: Response) => {
    try {
        const userId: string = (req as any).userId;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const participatedEventIds = user.participatedEvents || [];
        const allEvents = await EventModel.all();
        const registeredEvents = allEvents.filter(event => event.id && participatedEventIds.includes(event.id));

        res.status(200).json({ events: registeredEvents });
    } catch (error) {
        errorLogger.error({ error }, "Error fetching registered events");
        res.status(500).json({ error: "Internal server error" });
    }
};
