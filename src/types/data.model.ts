export interface User {
    id : string
    name : string
    email : string
    password : string
    events? : [string]
    createdEvents?: string[]
    participatedEvents?: string[]
    createdAt : Date
    updatedAt : Date
}

export interface Event {
    id? : string
    title : string
    description : string
    location : string
    price : string
    numberOfTickets : number
    createddBy : string
    dateOfConduct : Date 
    participants ?: [string]
    remainingTickets : number,
    createdAt? : Date
    updatedAt? : Date
}

