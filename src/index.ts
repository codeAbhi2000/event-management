const express = require("express")
import routes from "./routes"
import { httpLogger } from "./middleware/logger.middleware"
import logger from "./utils/logger"
import { Request,Response } from "express"



const app = express()

app.use(express.json())
app.use(httpLogger)


app.use("/api",routes)

app.use("/health", (req : Request,res: Response)=>{
    logger.info("Health check endpoint called");
    res.status(200).send("OK")
})



const PORT = 3000



app.listen(PORT,()=>{
    logger.info(`Sever listening on PORT ${PORT}`)
    console.log(`Sever listening on PORT ${PORT}`)
})