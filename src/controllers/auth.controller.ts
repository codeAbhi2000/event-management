import { Request,Response } from "express"
import UserModel from "../model/user.model"
import logger, { errorLogger } from "../utils/logger";




export const register = async(req:Request, res:Response)=>{
    console.log(req.body);
    
    const {name,email,password} = req.body

    try {
        const user = await UserModel.findByEmail(email) 

    if(user) {
        return res.status(409).send({
            message : "user already exists"
        })
    }

    const hashedPass = await UserModel._hashThePassword(password)

    const newUser = await UserModel.create({name ,email,password : hashedPass})

    if (newUser) {
        // remove password before sending response
        delete (newUser as any).password
    }

    return res.status(201).send({
        message : "User created",
        user: newUser
    })
    } catch (error) {
      
        errorLogger.error({ error}, "Error during user registration");
        res.status(500).send({
            message : "something went wrong"
        })
        
    }

    


}

export const login = async (req:Request,res : Response)=>{
    const { email, password } = req.body;

    try {
        if (!email || !password) {
        return res.status(400).send({ message: "email and password are required" });
    }

    const user = await UserModel.findByEmail(email);

    if (!user) {
        return res.status(401).send({ message: "Invalid email or password" });
    }

    // compare provided password with stored hash
    
    const isMatch = await UserModel._comaparePassword({dbPassword :user.password,userPassed :password })

    if (!isMatch) {
        return res.status(401).send({ message: "Invalid email or password" });
    }

    // remove password before sending response
    delete (user as any).password;

    const token = await UserModel.generateToken({email ,userId : user.id})

    return res.status(200).send({
        message: "Login successful",
        token,
    });
    } catch (error) {
        console.log(error);
        errorLogger.error({ error}, "Error during login");
        res.status(500).send({
            message : "something went wrong"
        })
    }
} 