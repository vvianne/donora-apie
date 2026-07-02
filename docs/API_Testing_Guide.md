# API Testing Guide

This guide provides information on how to test the APIs for the Donora project.

## Endpoints

### Authentication

- **POST /login**: Log in a user.
- **POST /register**: Register a new user.

### Hospital

- **POST /request**: Create a blood request.
- **GET /request/{id}**: View a specific blood request.
- **PUT /request/{id}**: Update a blood request.
- **DELETE /request/{id}**: Cancel a blood request.

### Blood Bank

- **POST /inventory**: Add inventory.
- **PUT /inventory/{id}**: Update inventory.
- **DELETE /inventory/{id}**: Delete inventory.
- **GET /inventory**: View inventory.

### Donor

- **POST /availability**: Update donor availability.
- **GET /profile/{id}**: View donor profile.
- **POST /location**: Update donor location.
- **GET /donation_history/{id}**: View donation history.

### Transportation

- **POST /assign**: Assign transport.
- **POST /delivery/{id}/accept**: Accept delivery.
- **PUT /delivery/{id}**: Update delivery status.

### Notifications

- **POST /notify**: Create a notification.
- **GET /history/{id}**: View notification history.
