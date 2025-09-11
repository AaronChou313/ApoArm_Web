import React, { useState, useEffect } from 'react';

const ControlPanel = ({ onSendCommand, serialData }) => {
  const [angles, setAngles] = useState({
    yaw: 180,
    arm1: 90,
    arm2: 90
  });

  // 解析串口数据并更新角度
  useEffect(() => {
    if (serialData) {
      console.log('Processing serial data:', serialData);
      const match = serialData.match(/Yaw: (\d+) \| Arm1: (\d+) \| Arm2: (\d+)/);
      if (match) {
        setAngles({
          yaw: parseInt(match[1]),
          arm1: parseInt(match[2]),
          arm2: parseInt(match[3])
        });
      }
    }
  }, [serialData]);

  const handleSliderChange = (axis, value) => {
    setAngles(prev => ({
      ...prev,
      [axis]: parseInt(value)
    }));
  };

  const sendCommand = (id, value) => {
    const command = `${id} ${value}\r\n`;
    console.log('Sending command from frontend:', command);
    onSendCommand(command);
  };

  const sendAllCommands = () => {
    sendCommand(0, angles.yaw);
    sendCommand(1, angles.arm1);
    sendCommand(2, angles.arm2);
  };

  const resetToInitial = () => {
    setAngles({
      yaw: 180,
      arm1: 90,
      arm2: 90
    });
  };

  return (
    <div className="control-panel">
      <div className="control-group">
        <h3>机械臂控制</h3>
        
        <div className="slider-container">
          <label>旋转轴 (ID:0)</label>
          <input
            type="range"
            min="0"
            max="360"
            value={angles.yaw}
            onChange={(e) => handleSliderChange('yaw', e.target.value)}
          />
          <span>{angles.yaw}°</span>
          <button onClick={() => sendCommand(0, angles.yaw)}>发送</button>
        </div>
        
        <div className="slider-container">
          <label>大臂 (ID:1)</label>
          <input
            type="range"
            min="0"
            max="180"
            value={angles.arm1}
            onChange={(e) => handleSliderChange('arm1', e.target.value)}
          />
          <span>{angles.arm1}°</span>
          <button onClick={() => sendCommand(1, angles.arm1)}>发送</button>
        </div>
        
        <div className="slider-container">
          <label>小臂 (ID:2)</label>
          <input
            type="range"
            min="0"
            max="180"
            value={angles.arm2}
            onChange={(e) => handleSliderChange('arm2', e.target.value)}
          />
          <span>{angles.arm2}°</span>
          <button onClick={() => sendCommand(2, angles.arm2)}>发送</button>
        </div>
        
        <div className="control-buttons">
          <button className="send" onClick={sendAllCommands}>全部发送</button>
          <button className="reset" onClick={resetToInitial}>重置初始位置</button>
        </div>
      </div>
      
      <div className="control-group">
        <h3>串口状态</h3>
        {serialData ? (
          <div>
            <p style={{color: 'green', fontWeight: 'bold'}}>✓ 接收到数据</p>
            <p><strong>原始数据:</strong> {serialData}</p>
            <p><strong>解析结果:</strong></p>
            <ul>
              <li>旋转轴角度: {angles.yaw}°</li>
              <li>大臂角度: {angles.arm1}°</li>
              <li>小臂角度: {angles.arm2}°</li>
            </ul>
          </div>
        ) : (
          <p style={{color: 'orange'}}>等待串口数据...</p>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;