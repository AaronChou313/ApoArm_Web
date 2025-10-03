# ApoArm Web Control System

ApoArm Web Control System is a full-stack web application developed for controlling a custom-built robotic arm. It integrates Qwen-Plus v1 large language model to understand natural language commands and simultaneously control the robotic arm's movements.

## Features

- **Large Language Model Chat**: Interactive chat interface powered by Qwen-Plus v1 for natural language understanding
- **Manual Robotic Arm Control**: Direct control panel for manual manipulation of the robotic arm
- **Camera Video Stream**: Real-time video feed display from the robotic arm's camera
- **3D Robotic Arm Visualization**: Real-time 3D model rendering that mirrors the physical arm's movements

## System Architecture

The system consists of:
- **Frontend**: React-based user interface with Three.js for 3D visualization
- **Backend**: Node.js server for handling serial communication and API endpoints
- **Hardware Interface**: Serial communication with the robotic arm controller

## Installation

### Prerequisites

- Ubuntu/Debian-based Linux system
- Node.js and npm

### Setup Instructions

1. **Update system packages**:
   ```bash
   sudo apt update
   ```

2. **Install Node.js and npm**:
   ```bash
   sudo apt install nodejs npm
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

## Usage

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend application**:
   ```bash
   cd frontend
   npm start
   ```

3. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## Hardware Connection

The system communicates with the robotic arm through serial port connection. Make sure to:
1. Connect the robotic arm controller via USB
2. Check the correct serial port device path (e.g., `/dev/ttyUSB0`)
3. Configure the serial port settings in the application interface

## Development

The project is organized into two main directories:
- `backend/`: Contains the Node.js server code and serial communication handlers
- `frontend/`: Contains the React frontend application with 3D visualization components

## Troubleshooting

Common issues:
- **Serial port permissions**: Add your user to the `dialout` group with `sudo usermod -a -G dialout $USER`
- **Port already in use**: Check if another instance is running or another application is using the port
- **Connection refused**: Verify the robotic arm is properly connected and powered on