import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ElectronModel = ({ element }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!element) return;

    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // Nucleus (hạt nhân)
    const nucleusGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const nucleusMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red for nucleus
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    scene.add(nucleus);

    // Electrons (điện tử) - simplified for now
    const electronGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const electronMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue for electrons

    const electrons = [];
    const numElectrons = element.atomicNumber || 1; // Use atomic number for number of electrons

    for (let i = 0; i < numElectrons; i++) {
      const electron = new THREE.Mesh(electronGeometry, electronMaterial);
      const angle = (i / numElectrons) * Math.PI * 2;
      const radius = 1 + (i % 3) * 0.5; // Simple orbital layers
      electron.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      electrons.push(electron);
      scene.add(electron);
    }

    camera.position.z = 5;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      nucleus.rotation.x += 0.005;
      nucleus.rotation.y += 0.005;

      electrons.forEach((electron, index) => {
        const speed = 0.01 + (index % 3) * 0.005; // Different speeds for different layers
        electron.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), speed);
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
    };
  }, [element]);

  return <div ref={mountRef} style={{ width: '100%', height: '300px' }} />;
};

export default ElectronModel;