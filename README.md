# SMART DONATION PLATFORM

A real-time donation platform with WebSocket-based live updates and campaign tracking.

## Problem Statement

- Build a secure backend service where:
  - Users can donate to campaigns.
  - Admins can create campaigns.
  - Donations update in real-time using WebSocket.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Realtime**: Socket.IO
- **Auth**: JWT
- **Frontend (Minimal)**: React.js or HTML + JS
- **Deployment**: Render, Vercel

## Features

- **Campaign Creation**: Admins can create campaigns.
- **Donation to Campaigns**: Users can donate to active campaigns.
- **Real-Time Donation Stats**: Live updates of donation stats using WebSocket.
- **JWT-Based Authentication**: Secure authentication for both Admins and Donors.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/mohangowda22/smart-donation-platform.git
   cd smart-donation-platform/backend
   ```
2. npm install
3. Create a .env file in the backend directory and add the following:
   ```sh
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development
    ```
4. Start the server:
   1. npm run dev

Access the API at http://localhost:5000.

API Documentation
## API Documentation

Real-Time Updates
The platform uses WebSocket (via Socket.IO) to broadcast real-time donation updates to all connected clients.

### How It Works
1. When a client connects, a WebSocket connection is established using Socket.IO.
2. The server listens for donation events and broadcasts updates to all connected clients in real-time.
