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
        <h3>Robotic Arm Control</h3>
        
        <div className="slider-container">
          <label>Yaw (ID:0)</label>
          <input
            type="range"
            min="0"
            max="360"
            value={angles.yaw}
            onChange={(e) => handleSliderChange('yaw', e.target.value)}
          />
          <span>{angles.yaw}°</span>
          <button onClick={() => sendCommand(0, angles.yaw)}>Send</button>
        </div>
        
        <div className="slider-container">
          <label>Arm1 (ID:1)</label>
          <input
            type="range"
            min="0"
            max="180"
            value={angles.arm1}
            onChange={(e) => handleSliderChange('arm1', e.target.value)}
          />
          <span>{angles.arm1}°</span>
          <button onClick={() => sendCommand(1, angles.arm1)}>Send</button>
        </div>
        
        <div className="slider-container">
          <label>Arm2 (ID:2)</label>
          <input
            type="range"
            min="0"
            max="180"
            value={angles.arm2}
            onChange={(e) => handleSliderChange('arm2', e.target.value)}
          />
          <span>{angles.arm2}°</span>
          <button onClick={() => sendCommand(2, angles.arm2)}>Send</button>
        </div>
        
        <div className="control-buttons">
          <button className="send" onClick={sendAllCommands}>Send All</button>
          <button className="reset" onClick={resetToInitial}>Reset to Initial Position</button>
        </div>
      </div>
      
      <div className="control-group">
        <h3>Serial Status</h3>
        {serialData ? (
          <div>
            <p style={{color: 'green', fontWeight: 'bold'}}>✓ Data Received</p>
            <p><strong>Raw Data:</strong> {serialData}</p>
            <p><strong>Parsed Results:</strong></p>
            <ul>
              <li>Yaw Angle: {angles.yaw}°</li>
              <li>Arm1 Angle: {angles.arm1}°</li>
              <li>Arm2 Angle: {angles.arm2}°</li>
            </ul>
          </div>
        ) : (
          <p style={{color: 'orange'}}>Waiting for serial data...</p>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;