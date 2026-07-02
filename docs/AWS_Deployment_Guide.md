# AWS Deployment Guide

This document outlines the steps to deploy the Donora application on AWS using Docker.

## Prerequisites

- AWS account.
- Docker installed on your local machine.

## Steps to Deploy on AWS

1. **Create an EC2 Instance**: Launch an EC2 instance with Docker installed.
2. **SSH into the Instance**: Connect to your EC2 instance via SSH.
3. **Clone the Repository**: Clone the Donora repository from GitHub onto your EC2 instance.
4. **Navigate to the Project Directory**: Open a terminal and navigate to the project directory.
5. **Build the Docker Images**: Run the following command to build the Docker images:
   ```bash
   docker-compose build
   ```
6. **Run the Application**: Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```
7. **Access the Application**: Open your browser and go to the public IP of your EC2 instance.
