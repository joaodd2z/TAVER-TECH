"use client";
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GamePage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f0f);

    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    // Placeholder tavern: floor + few tables (cylinders) + bar (box)
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const tableMat = new THREE.MeshStandardMaterial({ color: 0x6c4a2f });
    for (let i = 0; i < 6; i++) {
      const tableGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 24);
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.set(-4 + i * 1.6, 0.4, -2 + (i % 2 === 0 ? 0 : 2));
      scene.add(table);
    }

    const barMat = new THREE.MeshStandardMaterial({ color: 0x3b2f2f });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(6, 1, 1.5), barMat);
    bar.position.set(0, 0.5, -6);
    scene.add(bar);

    // FPS controls (basic): WASD translation + mouse look
    const direction = new THREE.Vector3();
    let pitch = 0; // up/down
    let yaw = 0;   // left/right
    let pointerLocked = false;

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => keys.add(e.key.toLowerCase());
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const onMouseMove = (e: MouseEvent) => {
      if (!pointerLocked) return;
      yaw   -= e.movementX * 0.0025;
      pitch -= e.movementY * 0.0025;
      pitch = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, pitch));
      camera.rotation.set(pitch, yaw, 0, 'XYZ');
    };
    window.addEventListener('mousemove', onMouseMove);

    const onClick = () => {
      if (!pointerLocked) {
        renderer.domElement.requestPointerLock();
      }
    };
    const onPointerLockChange = () => {
      pointerLocked = document.pointerLockElement === renderer.domElement;
    };
    document.addEventListener('pointerlockchange', onPointerLockChange);
    renderer.domElement.addEventListener('click', onClick);

    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      direction.set(0, 0, 0);
      const speed = 3.0; // m/s

      if (keys.has('w')) direction.z -= 1;
      if (keys.has('s')) direction.z += 1;
      if (keys.has('a')) direction.x -= 1;
      if (keys.has('d')) direction.x += 1;

      direction.normalize();
      // Move relative to camera yaw
      const sin = Math.sin(yaw), cos = Math.cos(yaw);
      const dx = direction.x * cos - direction.z * sin;
      const dz = direction.x * sin + direction.z * cos;
      camera.position.x += dx * speed * delta;
      camera.position.z += dz * speed * delta;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    setLoading(false);
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      renderer.domElement.removeEventListener('click', onClick);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-[100vh] bg-black text-white">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="text-xl">Carregando taverna...</div>
            <div className="text-sm opacity-70">Clique para bloquear o mouse; WASD para mover</div>
          </div>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}