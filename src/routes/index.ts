import express from "express"
import authRoutes from "./auth.routes"
import eventRoutes from "./event.routes"

const router = express.Router()


router.use("/v1/auth",authRoutes)
router.use("/v1/event",eventRoutes)


export default router