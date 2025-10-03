import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import NavigationBar from './components/NavigationBar';
import ChatPanel from './components/ChatPanel';
import VideoStream from './components/VideoStream';
import RobotArm3D from './components/RobotArm3D';
import ControlPanel from './components/ControlPanel';
import './styles/App.css';

const socket = io('http://localhost:3001');

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am the robotic arm control assistant. Please tell me what operation you need.' }
  ]);
  const [serialPorts, setSerialPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [serialData, setSerialData] = useState('');
  const [angles, setAngles] = useState({
    yaw: 180,
    arm1: 90,
    arm2: 90
  });

  useEffect(() => {
    // 获取可用串口
    socket.emit('getSerialPorts');

    socket.on('serialPorts', (ports) => {
      setSerialPorts(ports);
      if (ports.length > 0) {
        setSelectedPort(ports[0].path);
      }
    });

    socket.on('serialData', (data) => {
      console.log('Received serial data:', data);
      setSerialData(data);
      // 解析角度数据
      const match = data.match(/Yaw: (\d+) \| Arm1: (\d+) \| Arm2: (\d+)/);
      if (match) {
        setAngles({
          yaw: parseInt(match[1]),
          arm1: parseInt(match[2]),
          arm2: parseInt(match[3])
        });
      }
    });

    // 监听串口连接状态
    socket.on('serialConnected', (response) => {
      if (response.success) {
        setIsConnected(true);
        console.log('Serial port connected successfully');
      } else {
        setIsConnected(false);
        console.error('Error connecting serial port:', response.error);
      }
    });

    // 监听串口关闭响应
    socket.on('serialClosed', (response) => {
      if (response.success) {
        setIsConnected(false);
        setSerialData(''); // 清空串口数据
        console.log('Serial port closed successfully');
      } else {
        console.error('Error closing serial port:', response.error);
      }
    });

    // 监听命令发送状态
    socket.on('commandSent', (response) => {
      console.log('Command sent status:', response);
    });

    // 监听LLM响应
    socket.on('llmResponse', (response) => {
      if (response.status === 'completed') {
        // 添加LLM的回复到聊天记录
        setMessages(prev => [...prev, { sender: 'bot', text: response.message }]);

        // 如果响应包含控制命令，解析并发送到机械臂
        if (/^\d+ \d+/.test(response.message)) {  // 检查是否为数字格式命令
          const commands = response.message.split('\n');
          commands.forEach(cmd => {
            if (/^\d+ \d+/.test(cmd.trim())) {  // 验证命令格式
              handleSendCommand(cmd.trim() + '\r\n');  // 添加回车换行符
            }
          });
        }
      } else if (response.status === 'processing') {
        // 显示处理中的状态
        setMessages(prev => [...prev, { sender: 'bot', text: response.message }]);
      } else if (response.status === 'error') {
        // 显示错误信息
        setMessages(prev => [...prev, { sender: 'bot', text: response.message }]);
      }
    });

    return () => {
      socket.off('serialPorts');
      socket.off('serialData');
      socket.off('llmResponse');
      socket.off('serialConnected');
      socket.off('serialClosed');
      socket.off('commandSent');
    };
  }, []);

  const handleConnect = () => {
    if (selectedPort) {
      socket.emit('initSerial', selectedPort);
    }
  };

  const handleDisconnect = () => {
    // 发送断开串口连接的请求到后端
    socket.emit('closeSerial');
  };

  const handleSendMessage = (message) => {
    // 添加用户消息
    const newMessages = [...messages, { sender: 'user', text: message }];
    setMessages(newMessages);

    // 发送消息到LLM处理
    socket.emit('processCommand', message);
  };

  const handleSendCommand = (command) => {
    socket.emit('sendCommand', command);
  };

  return (
    <div className="App">
      <NavigationBar />

      <div className="serial-panel">
        <select
          value={selectedPort}
          onChange={(e) => setSelectedPort(e.target.value)}
          disabled={isConnected}
        >
          {serialPorts.map((port, index) => (
            <option key={index} value={port.path}>
              {port.path} ({port.manufacturer || 'Unknown'})
            </option>
          ))}
        </select>

        {!isConnected ? (
          <button onClick={handleConnect}>Connect Serial</button>
        ) : (
          <button className="disconnect" onClick={handleDisconnect}>Disconnect</button>
        )}

        <span>Status: {isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div className="main-content">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
        />

        <div className="control-section">
          <div className="top-section">
            <VideoStream />
            <RobotArm3D angles={angles} />
          </div>
          <ControlPanel
            onSendCommand={handleSendCommand}
            serialData={serialData}
          />
        </div>
      </div>
    </div>
  );
}

export default App;