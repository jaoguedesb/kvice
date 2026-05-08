import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { HeartPulse, Stethoscope, Bone, Wind, RotateCcw } from "lucide-react";

function Rib({ side = 1, y = 0, scale = 1, highlighted = false }) {
  return (
    <mesh position={[side * 1.05, y, 0]} rotation={[0, 0, side * 0.35]} scale={[scale, 0.055, 0.055]}>
      <torusGeometry args={[0.72, 0.018, 12, 60, Math.PI * 1.15]} />
      <meshStandardMaterial
        color={highlighted ? "#f8fafc" : "#cbd5e1"}
        transparent
        opacity={highlighted ? 0.95 : 0.45}
        roughness={0.35}
      />
    </mesh>
  );
}

function RibCage({ activePart }) {
  const ribs = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      y: 1.15 - i * 0.27,
      scale: 1 - i * 0.035,
    }));
  }, []);

  const highlighted = activePart === "ribs" || activePart === "all";

  return (
    <group>
      <mesh position={[0, 0.05, 0]} scale={[0.08, 1.65, 0.08]}>
        <boxGeometry />
        <meshStandardMaterial color={highlighted ? "#ffffff" : "#cbd5e1"} transparent opacity={highlighted ? 0.95 : 0.55} />
      </mesh>

      <mesh position={[0, 1.48, 0]} scale={[0.36, 0.18, 0.08]}>
        <boxGeometry />
        <meshStandardMaterial color={highlighted ? "#ffffff" : "#cbd5e1"} transparent opacity={highlighted ? 0.95 : 0.55} />
      </mesh>

      {ribs.map((rib, index) => (
        <React.Fragment key={index}>
          <Rib side={1} y={rib.y} scale={rib.scale} highlighted={highlighted} />
          <Rib side={-1} y={rib.y} scale={rib.scale} highlighted={highlighted} />
        </React.Fragment>
      ))}
    </group>
  );
}

function Lung({ side = 1, activePart }) {
  const highlighted = activePart === "lungs" || activePart === "all";

  return (
    <group position={[side * 0.55, 0.1, 0]}>
      <mesh scale={[0.47, 0.95, 0.28]} rotation={[0.08, 0, side * -0.12]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color={highlighted ? "#38bdf8" : "#7dd3fc"}
          transparent
          opacity={highlighted ? 0.82 : 0.45}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[side * -0.13, -0.33, 0.02]} scale={[0.34, 0.62, 0.26]} rotation={[0, 0, side * 0.18]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color={highlighted ? "#0ea5e9" : "#7dd3fc"}
          transparent
          opacity={highlighted ? 0.72 : 0.38}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

function Heart({ activePart }) {
  const highlighted = activePart === "heart" || activePart === "all";

  return (
    <group position={[0.08, -0.12, 0.12]} rotation={[0.1, -0.18, -0.2]}>
      <mesh scale={[0.34, 0.45, 0.32]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color={highlighted ? "#ef4444" : "#f87171"} transparent opacity={highlighted ? 0.95 : 0.62} />
      </mesh>
      <mesh position={[-0.17, 0.3, 0]} scale={[0.22, 0.25, 0.2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={highlighted ? "#dc2626" : "#fb7185"} transparent opacity={highlighted ? 0.95 : 0.68} />
      </mesh>
      <mesh position={[0.18, 0.28, 0]} scale={[0.23, 0.25, 0.2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={highlighted ? "#dc2626" : "#fb7185"} transparent opacity={highlighted ? 0.95 : 0.68} />
      </mesh>
    </group>
  );
}

function Trachea({ activePart }) {
  const highlighted = activePart === "trachea" || activePart === "all";

  return (
    <group>
      <mesh position={[0, 1.18, 0.03]}>
        <cylinderGeometry args={[0.075, 0.075, 0.9, 32]} />
        <meshStandardMaterial color={highlighted ? "#22c55e" : "#86efac"} transparent opacity={highlighted ? 0.9 : 0.5} />
      </mesh>
      <mesh position={[-0.22, 0.68, 0.03]} rotation={[0, 0, -0.65]}>
        <cylinderGeometry args={[0.045, 0.045, 0.55, 32]} />
        <meshStandardMaterial color={highlighted ? "#16a34a" : "#86efac"} transparent opacity={highlighted ? 0.9 : 0.5} />
      </mesh>
      <mesh position={[0.22, 0.68, 0.03]} rotation={[0, 0, 0.65]}>
        <cylinderGeometry args={[0.045, 0.045, 0.55, 32]} />
        <meshStandardMaterial color={highlighted ? "#16a34a" : "#86efac"} transparent opacity={highlighted ? 0.9 : 0.5} />
      </mesh>
    </group>
  );
}

function Labels({ activePart }) {
  const showAll = activePart === "all";
  const visible = (part) => showAll || activePart === part;

  return (
    <group>
      {visible("lungs") && (
        <Text position={[1.55, 0.2, 0]} fontSize={0.12} color="#e0f2fe" anchorX="left">
          Pulmões
        </Text>
      )}
      {visible("heart") && (
        <Text position={[0.72, -0.42, 0.25]} fontSize={0.12} color="#fecaca" anchorX="left">
          Coração
        </Text>
      )}
      {visible("trachea") && (
        <Text position={[0.28, 1.45, 0.12]} fontSize={0.12} color="#bbf7d0" anchorX="left">
          Traqueia
        </Text>
      )}
      {visible("ribs") && (
        <Text position={[-1.75, 0.85, 0]} fontSize={0.12} color="#f8fafc" anchorX="left">
          Caixa torácica
        </Text>
      )}
    </group>
  );
}

function ThoraxScene({ activePart }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 5, 6]} intensity={1.5} />
      <pointLight position={[-3, 2, 3]} intensity={0.8} />

      <group position={[0, -0.1, 0]}>
        <RibCage activePart={activePart} />
        <Lung side={-1} activePart={activePart} />
        <Lung side={1} activePart={activePart} />
        <Heart activePart={activePart} />
        <Trachea activePart={activePart} />
        <Labels activePart={activePart} />
      </group>

      <mesh position={[0, -1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.025, 16, 100]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.45} />
      </mesh>

      <Html position={[0, -1.65, 0]} center>
        <div className="scene-hint">Arraste para girar • Scroll para zoom</div>
      </Html>

      <OrbitControls enablePan={false} minDistance={2.4} maxDistance={6.5} />
    </>
  );
}

const parts = [
  { id: "all", label: "Tudo", icon: RotateCcw, description: "Visualização geral da região torácica." },
  { id: "lungs", label: "Pulmões", icon: Stethoscope, description: "Órgãos responsáveis pelas trocas gasosas." },
  { id: "heart", label: "Coração", icon: HeartPulse, description: "Estrutura central do sistema cardiovascular." },
  { id: "trachea", label: "Traqueia", icon: Wind, description: "Via aérea principal que se divide em brônquios." },
  { id: "ribs", label: "Caixa torácica", icon: Bone, description: "Estrutura óssea de proteção do tórax." },
];

export default function SimulacaoToracica3D() {
  const [activePart, setActivePart] = useState("all");
  const selected = parts.find((part) => part.id === activePart) || parts[0];

  return (
    <main className="app-shell">
      <div className="layout">
        <motion.aside initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="control-card">
          <section className="intro">
            <p>Simulação 3D</p>
            <h1>Região Torácica Interativa</h1>
            <span>Modelo didático para apresentar estruturas principais do tórax de forma visual, objetiva e interativa.</span>
          </section>

          <nav className="part-list" aria-label="Selecionar estrutura anatômica">
            {parts.map((part) => {
              const Icon = part.icon;
              const active = activePart === part.id;

              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => setActivePart(part.id)}
                  className={`part-button ${active ? "active" : ""}`}
                  aria-pressed={active}
                >
                  <Icon aria-hidden="true" />
                  <span>{part.label}</span>
                </button>
              );
            })}
          </nav>

          <section className="detail-panel">
            <h2>{selected.label}</h2>
            <p>{selected.description}</p>
          </section>

          <p className="warning">
            Este modelo é educativo e simplificado. Não substitui materiais anatômicos oficiais, avaliação médica ou diagnóstico profissional.
          </p>
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="canvas-panel"
          aria-label="Modelo 3D da região torácica"
        >
          <Canvas camera={{ position: [0, 0.4, 4.2], fov: 45 }}>
            <ThoraxScene activePart={activePart} />
          </Canvas>
        </motion.section>
      </div>
    </main>
  );
}
