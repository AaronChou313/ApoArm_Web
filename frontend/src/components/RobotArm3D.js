import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

function ArmSegment({ position, rotation, length, radiusTop = 0.1, radiusBottom = 0.1, color }) {
  const meshRef = useRef();
  
  if (length === 0) {
    return (
      <group position={position} rotation={rotation}>
        <Sphere args={[0.2, 16, 16]}>
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
        </Sphere>
      </group>
    );
  }

  return (
    <group position={position} rotation={rotation}>
      <Cylinder 
        ref={meshRef} 
        args={[radiusTop, radiusBottom, length, 16]} 
        position={[0, length / 2, 0]}
      >
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </Cylinder>
      
      <Sphere position={[0, length, 0]} args={[0.15, 16, 16]}>
        <meshStandardMaterial color="#555" metalness={0.5} roughness={0.2} />
      </Sphere>
    </group>
  );
}

function RobotArm({ angles }) {
  // 舵机角度 (转换为弧度)
  const yaw = (angles.yaw || 0) * Math.PI / 180; // id=0, 默认0度
  const arm1Angle = (angles.arm1 || 90) * Math.PI / 180; // id=1
  const arm2Angle = (angles.arm2 || 90) * Math.PI / 180; // id=2
  
  // 计算各部分位置
  const baseHeight = 0.3;
  const arm1Length = 1.5;
  const arm2Length = 1.2;
  
  return (
    <group>
      {/* 底座 */}
      <Cylinder 
        position={[0, baseHeight/2, 0]} 
        args={[0.5, 0.6, baseHeight, 32]}
      >
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </Cylinder>
      
      {/* 旋转轴关节 */}
      <group position={[0, baseHeight, 0]} rotation={[0, yaw, 0]}>
        <ArmSegment 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]} 
          length={0} 
          color="#7f8c8d" 
        />
        
        {/* 第一大臂 */}
        <ArmSegment 
          position={[0, 0, 0]} 
          rotation={[Math.PI/2 - arm1Angle, 0, 0]} 
          length={arm1Length} 
          radiusTop={0.15}
          radiusBottom={0.12}
          color="#3498db" 
        />
        
        {/* 第二小臂 - 连接在大臂末端 */}
        <group 
          position={[0, Math.cos(Math.PI/2 - arm1Angle) * arm1Length, Math.sin(Math.PI/2 - arm1Angle) * arm1Length]}
          rotation={[Math.PI/2 - arm1Angle, 0, 0]}
        >
          <ArmSegment 
            position={[0, 0, 0]} 
            rotation={[arm1Angle - Math.PI/2 + arm2Angle - Math.PI, 0, 0]} 
            length={arm2Length} 
            radiusTop={0.12}
            radiusBottom={0.1}
            color="#e74c3c" 
          />
          
          {/* 末端执行器 */}
          <Sphere position={[
            0,
            Math.cos(arm1Angle - Math.PI/2 + arm2Angle - Math.PI) * arm2Length,
            Math.sin(arm1Angle - Math.PI/2 + arm2Angle - Math.PI) * arm2Length
          ]} args={[0.1, 16, 16]}>
            <meshStandardMaterial color="#2ecc71" metalness={0.6} roughness={0.3} />
          </Sphere>
        </group>
      </group>
      
      {/* 文字标注 */}
      <Text
        position={[0, baseHeight + 3, 0]}
        color="white"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {`Yaw: ${angles.yaw || 0}°`}
      </Text>
      <Text
        position={[0, baseHeight + 2.5, 0]}
        color="white"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {`Arm1: ${angles.arm1 || 90}°`}
      </Text>
      <Text
        position={[0, baseHeight + 2, 0]}
        color="white"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {`Arm2: ${angles.arm2 || 90}°`}
      </Text>
    </group>
  );
}

function Scene({ angles }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />
      <RobotArm angles={angles} />
      <gridHelper args={[10, 20, '#3498db', '#2c3e50']} position={[0, 0, 0]} />
      <axesHelper args={[5]} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </>
  );
}

const RobotArm3D = ({ angles }) => {
  return (
    <div className="simulation-panel">
      <Canvas 
        camera={{ position: [4, 3, 6], fov: 50 }}
        shadows
      >
        <Scene angles={angles} />
      </Canvas>
    </div>
  );
};

export default RobotArm3D;