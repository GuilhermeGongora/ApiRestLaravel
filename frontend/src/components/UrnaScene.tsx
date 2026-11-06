import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

function useLabel(text: string, color = '#182b40', background = '#ffffff') {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = 'bold 128px Arial, sans-serif';
      context.fillText(text, 256, 136);
    }
    const image = new THREE.CanvasTexture(canvas);
    image.colorSpace = THREE.SRGBColorSpace;
    return image;
  }, [text, color, background]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function NumberKey({ digit, x, y }: { digit: string; x: number; y: number }) {
  const label = useLabel(digit);
  return (
    <group position={[x, y, 0.645]}>
      <mesh castShadow>
        <boxGeometry args={[0.19, 0.14, 0.08]} />
        <meshStandardMaterial color="#f5f7f8" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[0.13, 0.09]} />
        <meshBasicMaterial map={label} />
      </mesh>
    </group>
  );
}

function ActionKey({ x, label, color }: { x: number; label: string; color: string }) {
  const text = useLabel(label, '#16283a', color);
  return (
    <group position={[x, -0.57, 0.651]}>
      <mesh castShadow>
        <boxGeometry args={[0.25, 0.13, 0.09]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.048]}>
        <planeGeometry args={[0.21, 0.09]} />
        <meshBasicMaterial map={text} />
      </mesh>
    </group>
  );
}

function Display() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#edf3f1';
      context.fillRect(0, 0, 1024, 768);
      context.fillStyle = '#71869c';
      context.font = '600 35px Arial, sans-serif';
      context.fillText('SEU VOTO PARA', 70, 105);
      context.fillStyle = '#172c41';
      context.font = 'bold 68px Arial, sans-serif';
      context.fillText('CANDIDATO', 70, 185);
      context.fillStyle = '#9eafb6';
      context.fillRect(70, 230, 880, 3);
      context.fillStyle = '#566b80';
      context.font = '600 37px Arial, sans-serif';
      context.fillText('NÚMERO', 70, 305);
      context.fillStyle = '#1c3546';
      context.font = 'bold 92px Arial, sans-serif';
      context.fillText('1  2  3  4  5', 70, 440);
      context.fillStyle = '#209b91';
      context.font = 'bold 38px Arial, sans-serif';
      context.fillText('ELEIÇÃO LAB  •  DEMO', 70, 640);
    }
    const image = new THREE.CanvasTexture(canvas);
    image.colorSpace = THREE.SRGBColorSpace;
    return image;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group position={[-0.58, 0.05, 0.612]}>
      <mesh castShadow>
        <boxGeometry args={[1.38, 1.02, 0.08]} />
        <meshStandardMaterial color="#19283a" metalness={0.2} roughness={0.46} />
      </mesh>
      <mesh position={[0, 0, 0.044]}>
        <planeGeometry args={[1.21, 0.87]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

function UrnaModel() {
  const model = useRef<THREE.Group>(null);
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];

  useFrame(({ clock, pointer }) => {
    if (!model.current) return;
    model.current.position.y = 0.12 + Math.sin(clock.elapsedTime * 0.85) * 0.065;
    model.current.rotation.y = -0.22 + Math.sin(clock.elapsedTime * 0.3) * 0.11 + pointer.x * 0.08;
    model.current.rotation.x = -0.08 + pointer.y * 0.035;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.16, 0]} receiveShadow>
        <circleGeometry args={[2.3, 80]} />
        <meshStandardMaterial color="#14223e" roughness={0.92} />
      </mesh>
      <group ref={model} rotation={[0, -0.18, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.88, 1.72, 1.12]} />
          <meshStandardMaterial color="#e7eaf0" roughness={0.62} metalness={0.13} />
        </mesh>
        <mesh position={[0, -0.91, 0.03]} castShadow>
          <boxGeometry args={[2.66, 0.2, 1.04]} />
          <meshStandardMaterial color="#17263d" roughness={0.55} metalness={0.26} />
        </mesh>
        <mesh position={[0, 0.79, 0.48]} castShadow>
          <boxGeometry args={[2.56, 0.14, 0.16]} />
          <meshStandardMaterial color="#d4dce5" roughness={0.55} />
        </mesh>
        <Display />
        <mesh position={[0.91, 0.03, 0.59]} castShadow>
          <boxGeometry args={[0.94, 1.44, 0.08]} />
          <meshStandardMaterial color="#1d2a3b" metalness={0.18} roughness={0.5} />
        </mesh>
        {digits.map((digit, index) => digit ? (
          <NumberKey digit={digit} x={0.61 + index % 3 * 0.3} y={0.49 - Math.floor(index / 3) * 0.29} key={digit} />
        ) : null)}
        <ActionKey x={0.62} label="B" color="#e7eae7" />
        <ActionKey x={0.92} label="C" color="#f2a36a" />
        <ActionKey x={1.22} label="OK" color="#49c59c" />
        <mesh position={[-1.1, 0.73, 0.579]}>
          <boxGeometry args={[0.34, 0.07, 0.045]} />
          <meshStandardMaterial color="#378bda" emissive="#226cff" emissiveIntensity={0.28} />
        </mesh>
        <mesh position={[1.08, 0.75, 0.58]}>
          <boxGeometry args={[0.35, 0.085, 0.05]} />
          <meshStandardMaterial color="#4fa9ff" emissive="#3873ff" emissiveIntensity={0.24} />
        </mesh>
      </group>
    </group>
  );
}

export function UrnaScene() {
  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ position: [0.4, 0.8, 5.3], fov: 39 }} fallback={<div className="scene-fallback">Visualização 3D indisponível neste navegador.</div>}>
      <color attach="background" args={['#101b34']} />
      <ambientLight intensity={1.4} />
      <directionalLight color="#edf6ff" position={[-2, 5, 5]} intensity={3.2} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight color="#7199ff" position={[-3, 1, 2]} intensity={35} distance={9} />
      <pointLight color="#3be3d1" position={[3, 0, -1]} intensity={22} distance={7} />
      <UrnaModel />
    </Canvas>
  );
}
