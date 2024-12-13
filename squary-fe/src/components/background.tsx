import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    // Crear la escena
    const scene = new THREE.Scene();

    // Crear la cámara
    const camera = new THREE.PerspectiveCamera(
      40,
      mount.clientWidth / mount.clientHeight,
      0.1,
      10000
    );
    camera.position.z = 5;

    // Crear el renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff, 1); // Fondo blanco
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

     // Generar una textura circular manualmente
     const generateCircleTexture = () => {
      const size = 50; // Tamaño de la textura
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');

      // Dibujar un círculo
      context.beginPath();
      context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      context.fillStyle = 'black'; // Color del círculo
      context.fill();
      return new THREE.CanvasTexture(canvas);
    };

    const circleTexture = generateCircleTexture();

    // Crear partículas
    const particleCount = 4000;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x000000, // Color negro
      size: 0.02, // Tamaño de las partículas
      sizeAttenuation: true, // Tamaño ajustado a la perspectiva
      map: circleTexture, // Aplicar textura circular
      transparent: true, // Hacer transparente los bordes
    });

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10; // Partículas distribuidas aleatoriamente
    }
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotar las partículas
      particles.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // Limpieza al desmontar el componente
    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ParticleBackground;
