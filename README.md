# Event Management Backend

A backend system for a virtual event management platform, built with Node.js, Express, and TypeScript. It uses in-memory data structures (persisted to JSON files) for data storage.

## Features

- **User Authentication**: Register and login with JWT-based authentication.
- **Event Management**: Create, read, update, and delete events.
- **Participant Management**: Register for events and receive email notifications (mocked).
- **Secure**: Password hashing with bcrypt and input validation.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Ensure a `.env` file exists with the following (or similar):
    ```env
    JWT_SECRETE=your_secret_key
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build and Run**:
    ```bash
    npm run build
    npm start
    ```

## API Endpoints

### Authentication

#### Register
- **URL**: `/api/v1/auth/register`
- **Method**: `POST`
- **Body**:
    ```json
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123"
    }
    ```
- **Response**: 201 Created

#### Login
- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Body**:
    ```json
    {
        "email": "john@example.com",
        "password": "password123"
    }
    ```
- **Response**: 200 OK (returns JWT token)

### Events

#### Create Event
- **URL**: `/api/v1/event`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
    ```json
    {
        "title": "Tech Conference",
        "description": "A conference about tech",
        "date": "2024-12-25",
        "location": "Virtual",
        "price": 0,
        "numberOfTickets": 100
    }
    ```
- **Response**: 201 Created

#### Get Events
- **URL**: `/api/v1/event`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK (list of events)

#### Get Created Events
- **URL**: `/api/v1/event/created`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK (list of events created by the user)

#### Get Registered Events
- **URL**: `/api/v1/event/registered`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK (list of events the user has registered for)

#### Update Event
- **URL**: `/api/v1/event/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: (Partial event object)
- **Response**: 200 OK

#### Delete Event
- **URL**: `/api/v1/event/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK

#### Register for Event
- **URL**: `/api/v1/event/:id/register`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200 OK (Sends confirmation email)

## Testing

Run the verification script:
```bash
npx ts-node scripts/test_api.ts
```
