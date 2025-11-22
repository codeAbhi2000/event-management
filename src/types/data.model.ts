export interface User {
    id : string
    name : string
    email : string
    password : string
    events? : [string]
    createdAt : Date
    updatedAt : Date
}

export interface Event {
    id : string
    venue : string
    price : string
    numberOfTickets : Number
    cretaedBy : [string]
    dateOfConduct : Date 
    participants : [string]
    remainingTickets : Number
}

