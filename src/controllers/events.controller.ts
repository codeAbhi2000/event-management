import { errorLogger } from "../utils/logger";
import { Request, Response } from "express";
import EventModel from "../model/event.model";
import { Event } from "../types/data.model";


export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, date, location, description,userId ,price,numberOfTickets} = req.body;
    // Here you would typically save the event to the database
    
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
    const userId : string = req.body.userId;
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
    event.participants = event.participants ? [...event.participants, userId] : [userId];
    event.remainingTickets -= 1;
    const updatedEvent = await EventModel.update(eventId, {
      participants: event.participants,
      remainingTickets: event.remainingTickets,
    });
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

