const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let port = null;
let parser = null;

async function getSerialPorts() {
  try {
    const ports = await SerialPort.list();
    return ports.map(p => ({
      path: p.path,
      manufacturer: p.manufacturer,
      vendorId: p.vendorId,
      productId: p.productId
    }));
  } catch (error) {
    console.error('Error listing serial ports:', error);
    return [];
  }
}

function initializeSerial(portPath, onDataCallback) {
  return new Promise((resolve, reject) => {
    try {
      // 关闭已有的连接
      if (port && port.isOpen) {
        port.close(() => {
          console.log('Previous port closed');
        });
      }

      // 检查端口路径是否存在
      if (!portPath) {
        reject(new Error('Port path is required'));
        return;
      }

      // 创建新的串口连接
      port = new SerialPort({
        path: portPath,
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      }, (err) => {
        if (err) {
          console.error('Error opening port:', err.message);
          reject(err);
          return;
        }
        
        console.log(`Serial port ${portPath} opened successfully`);
        resolve(true);
      });

      // 设置解析器
      parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      // 监听数据
      parser.on('data', (data) => {
        console.log('Received from serial:', data);
        if (onDataCallback) {
          onDataCallback(data);
        }
      });

      port.on('error', (err) => {
        console.error('Serial port error:', err.message);
        // 尝试自动重新连接
        if (err.code === 'EIO') {
          console.log('I/O error detected, attempting to close port');
          if (port && port.isOpen) {
            port.close(() => {
              console.log('Port closed after I/O error');
            });
          }
        }
      });

      port.on('close', () => {
        console.log('Serial port closed');
      });

    } catch (error) {
      console.error('Error initializing serial port:', error);
      reject(error);
    }
  });
}

function sendCommand(command) {
  return new Promise((resolve, reject) => {
    if (port && port.isOpen) {
      console.log('Sending command:', JSON.stringify(command));
      console.log('Command bytes:', Buffer.from(command).toString('hex'));
      
      port.write(command, (err) => {
        if (err) {
          console.error('Error sending command:', err.message);
          // 如果是I/O错误，尝试关闭端口
          if (err.code === 'EIO') {
            if (port && port.isOpen) {
              port.close(() => {
                console.log('Port closed after I/O error during write');
              });
            }
          }
          reject(err);
        } else {
          console.log('Command sent successfully');
          resolve(true);
        }
      });
    } else {
      console.error('Serial port is not open');
      reject(new Error('Serial port is not open'));
    }
  });
}

// 断开串口连接的函数
function closeSerial() {
  return new Promise((resolve) => {
    if (port && port.isOpen) {
      port.close((err) => {
        if (err) {
          console.error('Error closing serial port:', err.message);
        } else {
          console.log('Serial port closed successfully');
        }
        port = null;
        parser = null;
        resolve(!err);
      });
    } else {
      console.log('Serial port was not open');
      port = null;
      parser = null;
      resolve(true);
    }
  });
}

// 检查串口是否打开
function isSerialOpen() {
  return port && port.isOpen;
}

module.exports = {
  initializeSerial,
  sendCommand,
  getSerialPorts,
  closeSerial,
  isSerialOpen
};