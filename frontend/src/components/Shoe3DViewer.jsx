import React, { useRef, useState, useMemo, Suspense as ThreeSuspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Componente de la zapatilla Converse simplificada
function ConverseShoe({ customTexture }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  // Crear textura desde imagen cargada
  const texture = useMemo(() => {
    if (!customTexture) return null;

    try {
      const loader = new THREE.TextureLoader();
      const tex = loader.load(
        customTexture,
        undefined, // onLoad
        undefined, // onProgress
        (error) => console.error('Error loading texture:', error)
      );
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      return tex;
    } catch (error) {
      console.error('Error creating texture:', error);
      return null;
    }
  }, [customTexture]);

  return (
    <group
      ref={meshRef}
      rotation={[0, Math.PI * 0.25, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Suela - parte inferior */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <boxGeometry args={[2.5, 0.3, 3.5]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.8} />
      </mesh>

      {/* Cuerpo principal de la zapatilla */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[2.2, 1, 3.2]} />
        <meshStandardMaterial
          color={customTexture ? "#ffffff" : "#e63946"}
          map={texture}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Parte superior/cuello de la zapatilla */}
      <mesh position={[0, 1, -0.3]} castShadow>
        <cylinderGeometry args={[1, 1.1, 0.8, 32]} />
        <meshStandardMaterial
          color={customTexture ? "#ffffff" : "#e63946"}
          map={texture}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Puntera reforzada */}
      <mesh position={[0, -0.1, 1.5]} castShadow>
        <sphereGeometry args={[0.8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
      </mesh>

      {/* Banda lateral característica */}
      <mesh position={[1.15, 0.2, 0]} castShadow>
        <boxGeometry args={[0.1, 0.8, 2.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>

      <mesh position={[-1.15, 0.2, 0]} castShadow>
        <boxGeometry args={[0.1, 0.8, 2.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>

      {/* Cordones (simplificados) */}
      {[0.8, 0.4, 0, -0.4].map((z, i) => (
        <group key={i}>
          <mesh position={[0.5, 0.6, z]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#2b2d42" metalness={0.3} />
          </mesh>
          <mesh position={[-0.5, 0.6, z]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#2b2d42" metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Lengüeta */}
      <mesh position={[0, 0.5, 0.8]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.05, 1.5]} />
        <meshStandardMaterial
          color={customTexture ? "#ffffff" : "#e63946"}
          map={texture}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

// Componente principal del visualizador 3D
const Shoe3DViewer = ({ customDesign }) => {
  return (
    <div style={{ width: '100%', height: '600px', borderRadius: '20px', overflow: 'hidden', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />

        {/* Iluminación */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.8}
          castShadow
        />

        {/* Zapatilla */}
        <ConverseShoe customTexture={customDesign} />

        {/* Suelo con sombra */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {/* Controles de órbita */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default Shoe3DViewer;
