# On-Premise Deployment Guide

This document outlines the steps to deploy the Donora application on-premise using Docker and Docker Compose.

## Prerequisites

- Local server with Docker installed.
- Docker Compose installed.

## Steps to Deploy On-Premise

1. **Clone the Repository**: Clone the Donora repository from GitHub onto your local server.
2. **Navigate to the Project Directory**: Open a terminal and navigate to the project directory.
3. **Build the Docker Images**: Run the following command to build the Docker images:
   ```bash
   docker-compose build
   ```
4. **Run the Application**: Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```
5. **Access the Application**: Open your browser and go to the server's IP address.
