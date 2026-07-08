import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Icosahedron,
  MeshDistortMaterial,
  Sparkles,
} from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, Group, Mesh } from "three";

function useThemePrimary(): string {
  const [hex, setHex] = useState("#3d8a5e");
  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary")
        .trim();
      if (v) setHex(v);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });
    return () => observer.disconnect();
  }, []);
  return hex;
}

function Blob({ color }: { color: string }) {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.15;
    const px = state.pointer.x;
    const py = state.pointer.y;
    group.current.rotation.x += (py * 0.25 - group.current.rotation.x) * 0.05;
    group.current.position.x += (px * 0.3 - group.current.position.x) * 0.05;
  });
  const accentA: Color = useMemo(() => new Color(color), [color]);
  const accentB: Color = useMemo(() => new Color(color).offsetHSL(0, 0, 0.18), [color]);
  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.2}>
        <Icosahedron args={[1.7, 1]}>
          <meshStandardMaterial
            color={accentA}
            wireframe
            transparent
            opacity={0.25}
          />
        </Icosahedron>
        <mesh>
          <sphereGeometry args={[1.15, 64, 64]} />
          <MeshDistortMaterial
            color={accentA}
            roughness={0.25}
            metalness={0.35}
            distort={0.35}
            speed={1.6}
          />
        </mesh>
      </Float>
    </group>
  );
}

function Rings({ color }: { color: string }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.2;
  });
  const accentB: Color = useMemo(() => new Color(color).offsetHSL(0, 0, 0.18), [color]);
  return (
    <mesh ref={ref} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[2.6, 0.045, 16, 120]} />
      <meshStandardMaterial
        color={accentB}
        wireframe
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

export default function Scene3D() {
  const primary = useThemePrimary();
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 3]} intensity={1.3} />
      <pointLight position={[-4, -2, 2]} intensity={0.6} color={primary} />
      <Blob color={primary} />
      <Rings color={primary} />
      <Sparkles count={70} scale={9} size={2.2} speed={0.4} color={primary} />
    </Canvas>
  );
}
