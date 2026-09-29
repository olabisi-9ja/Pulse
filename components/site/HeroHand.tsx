"use client";

import type { Mesh } from "three";
import { useEffect, useRef } from "react";

/**
 * A gloved 3D hand that rises into view behind the hero phone on load, then
 * idles with a slow float. three.js is imported lazily so it never blocks
 * first paint. Model: WebXR generic hand (MIT, see public/3d/LICENSE-hand-model.md).
 */
export function HeroHand({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      if (disposed) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 10);
      camera.position.set(0, 0, 0.62);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x1b2a3a, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(0.4, 0.6, 0.8);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x2fb386, 3.2); // brand-green rim light
      rim.position.set(-0.6, 0.2, -0.5);
      scene.add(rim);

      const gltf = await new GLTFLoader().loadAsync("/3d/hand-right.glb");
      if (disposed) return;
      const hand = gltf.scene;
      const glove = new THREE.MeshPhysicalMaterial({ color: 0x15181d, roughness: 0.42, metalness: 0.05, clearcoat: 0.35, clearcoatRoughness: 0.5 });
      hand.traverse((o) => {
        if ((o as Mesh).isMesh) (o as Mesh).material = glove;
      });

      // The model's fingers point down (-Y) with the palm facing -X. Turn it
      // upright, palm to the viewer, then scale it so it wraps the phone's edges.
      const upright = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
      upright.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));
      hand.quaternion.copy(upright);
      hand.scale.setScalar(1.55);
      hand.updateMatrixWorld(true);
      const centre = new THREE.Box3().setFromObject(hand).getCenter(new THREE.Vector3());
      hand.position.set(-centre.x + 0.01, -centre.y + 0.03, -centre.z);
      const pivot = new THREE.Group();
      pivot.add(hand);
      scene.add(pivot);

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = el;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(h, 1);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      const start = performance.now();
      const riseMs = 1600;
      const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
      let raf = 0;
      let visible = true;
      const frame = (now: number) => {
        const t = reduce ? 1 : Math.min((now - start) / riseMs, 1);
        const e = easeOutBack(t);
        const idle = reduce ? 0 : Math.sin((now - start) / 1400) * 0.006;
        pivot.position.y = -0.34 * (1 - e) + idle;
        pivot.rotation.z = -0.35 * (1 - e) + 0.08;
        pivot.rotation.y = 0.25 * (1 - e) - 0.15;
        renderer.render(scene, camera);
        if (!reduce && visible) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      // Stop rendering while the hero is off-screen.
      const io = new IntersectionObserver(([entry]) => {
        const was = visible;
        visible = entry.isIntersecting;
        if (visible && !was && !reduce) raf = requestAnimationFrame(frame);
      });
      io.observe(el);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        renderer.dispose();
        glove.dispose();
        renderer.domElement.remove();
      };
    })().catch(() => {
      // Decorative only: if WebGL or the model fails, the hero still stands.
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={host} aria-hidden className={`pointer-events-none [&>canvas]:h-full [&>canvas]:w-full ${className}`} />;
}
