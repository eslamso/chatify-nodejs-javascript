# Chatify - Node.js & JavaScript

A feature-rich, real-time chat application built using Node.js, Express.js, and Socket.io. Chatify provides users with a seamless messaging experience, complete with user authentication and real-time communication.

## Features

- **User Authentication:** Secure sign-up and login using JWT for token-based authentication.
- **Real-Time Messaging:** Instant messaging enabled by Socket.io.
- **User Management:** CRUD operations for managing user profiles.
- **Typing Indicators:** Displays when users are typing.
- **Message History:** Stores and retrieves past messages securely.

## Technologies Used

- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **Express.js**: Web framework for Node.js.
- **Socket.io**: Real-time communication engine.
- **JWT**: Secure user authentication.
- **MongoDB**: NoSQL database.
- **Mongoose**: ODM library for MongoDB.
- **Bcrypt**: Password hashing.

## Endpoints Overview

### Authentication

- **POST** `/api/auth/register`: Register a new user.
- **POST** `/api/auth/login`: Authenticate user and return a token.

### Users

- **GET** `/api/users`: Retrieve all users.
- **GET** `/api/users/:id`: Get user details.
- **PUT** `/api/users/:id`: Update user info.
- **DELETE** `/api/users/:id`: Delete a user.

### Messages

- **GET** `/api/messages/:conversationId`: Get all messages in a conversation.
- **POST** `/api/messages`: Send a new message.

## Installation

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/eslamso/chatify-nodejs-javascript.git
   ```
2. **Navigate to the Directory:**
   ```bash
   cd chatify-nodejs-javascript
   ```
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Set Up Environment Variables:** Add a `.env` file:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   .
   .
   .
   ```
5. **Start the App:**
   ```bash
   npm start:dev
   ```

## Usage

- Open your browser at `http://localhost:3000`.
- Register or log in to start chatting.

---
