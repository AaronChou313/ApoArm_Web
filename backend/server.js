const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { initializeSerial, sendCommand, getSerialPorts, closeSerial, isSerialOpen } = require('./serialHandler');
const { processUserCommand } = require('./llmHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static('../frontend/public'));

let connectedClients = [];
let serialDataCallback = null;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  connectedClients.push(socket);
  
  // 发送可用串口列表
  getSerialPorts().then(ports => {
    socket.emit('serialPorts', ports);
  });

  // 处理初始化串口连接
  socket.on('initSerial', async (portPath) => {
    try {
      const result = await initializeSerial(portPath, (data) => {
        // 广播来自串口的数据到所有客户端
        connectedClients.forEach(client => {
          if (client.connected) {
            client.emit('serialData', data);
          }
        });
      });
      
      if (result) {
        socket.emit('serialConnected', { success: true, port: portPath });
      } else {
        socket.emit('serialConnected', { success: false, error: 'Failed to open serial port' });
      }
    } catch (error) {
      console.error('Error connecting to serial port:', error);
      socket.emit('serialConnected', { success: false, error: error.message });
    }
  });

  // 处理发送命令到串口
  socket.on('sendCommand', async (command) => {
    try {
      if (isSerialOpen()) {
        await sendCommand(command);
        socket.emit('commandSent', { success: true, command: command });
      } else {
        socket.emit('commandSent', { success: false, error: 'Serial port not open' });
      }
    } catch (error) {
      console.error('Error sending command:', error);
      // 如果是I/O错误，通知前端重新连接
      if (error.code === 'EIO') {
        socket.emit('commandSent', { success: false, error: 'Serial port I/O error. Please reconnect.' });
      } else {
        socket.emit('commandSent', { success: false, error: error.message });
      }
    }
  });

  // 处理LLM请求
  socket.on('processCommand', async (userInput) => {
    try {
      console.log('Processing user command:', userInput);
      
      // 发送处理中的状态
      socket.emit('llmResponse', { 
        status: 'processing', 
        message: 'Processing your command...' 
      });
      
      // 调用LLM处理用户输入
      const llmResponse = await processUserCommand(userInput);
      
      console.log('LLM response:', llmResponse);
      
      // 发送LLM响应给客户端
      socket.emit('llmResponse', { 
        status: 'completed', 
        message: llmResponse 
      });
      
      // 如果响应包含控制命令，则自动发送到机械臂
      if (/^\d+ \d+/.test(llmResponse)) {
        const commands = llmResponse.split('\n');
        for (const cmd of commands) {
          if (/^\d+ \d+/.test(cmd.trim())) {
            try {
              if (isSerialOpen()) {
                await sendCommand(cmd.trim() + '\r\n');
                socket.emit('commandSent', { success: true, command: cmd.trim() + '\\r\\n' });
              } else {
                socket.emit('commandSent', { success: false, error: 'Serial port not open' });
                break; // 如果端口关闭，停止发送命令
              }
            } catch (sendError) {
              console.error('Error sending command:', sendError);
              socket.emit('commandSent', { success: false, error: sendError.message });
              // 如果是I/O错误，停止发送更多命令
              if (sendError.code === 'EIO') {
                break;
              }
            }
            // 添加小延迟以避免命令过快发送
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    } catch (error) {
      console.error('Error processing command:', error);
      socket.emit('llmResponse', { 
        status: 'error', 
        message: 'Error processing command. Please try again.' 
      });
    }
  });

  // 处理断开串口连接
  socket.on('closeSerial', async () => {
    try {
      const result = await closeSerial();
      if (result) {
        socket.emit('serialClosed', { success: true });
      } else {
        socket.emit('serialClosed', { success: false, error: 'Failed to close serial port' });
      }
    } catch (error) {
      console.error('Error closing serial port:', error);
      socket.emit('serialClosed', { success: false, error: error.message });
    }
  });

  // 处理客户端断开连接
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients = connectedClients.filter(client => client.id !== socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});