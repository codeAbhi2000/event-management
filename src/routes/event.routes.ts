import { Router } from "express";

import { createEvent, getEvents, getEventById, updateEvent, deleteEvent, registerForEvent } from "../controllers/events.controller";
import { authenticate, hasAccess } from "../middleware/authenticator.middleware";

const router = Router();

router.post("/",authenticate ,createEvent);
router.get("/",authenticate ,getEvents);
router.get("/:id", authenticate,getEventById);
router.put("/:id",authenticate,hasAccess ,updateEvent);
router.delete("/:id",authenticate , hasAccess,deleteEvent);
router.post("/:id/register",authenticate , registerForEvent);

export default router; 
