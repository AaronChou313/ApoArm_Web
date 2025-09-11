import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

function ArmSegment({ position, rotation, length, color }) {
  const meshRef = useRef();
  
  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef} position={[0, 0, length / 2]}>
        <cylinderGeometry args={[0.1, 0.1, length, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {length > 0 && (
        <mesh position={[0, 0, length]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      )}
    </group>
  );
}

function RobotArm({ angles }) {
  const baseRef = useRef();
  
  // 舵机角度 (转换为弧度)
  const yaw = (angles.yaw || 180) * Math.PI / 180; // id=0
  const arm1Angle = (angles.arm1 || 90) * Math.PI / 180; // id=1
  const arm2Angle = (angles.arm2 || 90) * Math.PI / 180; // id=2
  
  // 计算各部分位置
  const baseHeight = 0.5;
  const arm1Length = 1.5;
  const arm2Length = 1.2;
  
  // 第一大臂的末端位置
  const arm1EndX = Math.sin(arm1Angle) * arm1Length;
  const arm1EndZ = -Math.cos(arm1Angle) * arm1Length;
  
  // 第二小臂的末端位置 (相对于大臂)
  const arm2EndX = Math.sin(arm2Angle) * arm2Length;
  const arm2EndZ = -Math.cos(arm2Angle) * arm2Length;
  
  return (
    <group>
      {/* 底座 */}
      <mesh ref={baseRef} position={[0, baseHeight/2, 0]}>
        <cylinderGeometry args={[0.3, 0.4, baseHeight, 32]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      
      {/* 旋转轴 */}
      <ArmSegment 
        position={[0, baseHeight, 0]} 
        rotation={[0, yaw, 0]} 
        length={0} 
        color="#777" 
      />
      
      {/* 第一大臂 */}
      <ArmSegment 
        position={[0, baseHeight, 0]} 
        rotation={[0, yaw, arm1Angle - Math.PI/2]} 
        length={arm1Length} 
        color="#3498db" 
      />
      
      {/* 第二小臂 */}
      <ArmSegment 
        position={[
          Math.sin(yaw) * arm1EndX, 
          baseHeight + arm1EndZ, 
          Math.cos(yaw) * arm1EndX
        ]} 
        rotation={[0, yaw, arm1Angle + arm2Angle - Math.PI/2]} 
        length={arm2Length} 
        color="#e74c3c" 
      />
      
      {/* 文字标注 */}
      <Text
        position={[0, baseHeight + 2, 0]}
        color="black"
        fontSize={0.2}
        anchorX="center"
        anchorY="middle"
      >
        {`Yaw: ${angles.yaw || 180}°`}
      </Text>
      <Text
        position={[0, baseHeight + 1.7, 0]}
        color="black"
        fontSize={0.2}
        anchorX="center"
        anchorY="middle"
      >
        {`Arm1: ${angles.arm1 || 90}°`}
      </Text>
      <Text
        position={[0, baseHeight + 1.4, 0]}
        color="black"
        fontSize={0.2}
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
      <pointLight position={[10, 10, 10]} />
      <RobotArm angles={angles} />
      <gridHelper args={[10, 10]} />
      <axesHelper args={[5]} />
      <OrbitControls />
    </>
  );
}

const RobotArm3D = ({ angles }) => {
  return (
    <div className="simulation-panel">
      <Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
        <Scene angles={angles} />
      </Canvas>
    </div>
  );
};

export default RobotArm3D;