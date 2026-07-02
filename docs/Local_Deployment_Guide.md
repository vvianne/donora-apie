# Local Deployment Guide

This document outlines the steps to deploy the Donora application locally using Docker and Docker Compose.

## Prerequisites

- Docker installed on your machine.
- Docker Compose installed.

## Steps to Deploy Locally

1. **Clone the Repository**: Clone the Donora repository from GitHub.
2. **Navigate to the Project Directory**: Open a terminal and navigate to the project directory.
3. **Build the Docker Images**: Run the following command to build the Docker images:
   ```bash
   docker-compose build
   ```
4. **Run the Application**: Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```
5. **Access the Application**: Open your browser and go to `http://localhost:5000` to access the application.
