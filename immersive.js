const sceneRoot = document.querySelector("[data-cinematic-scene]");
const canvas = document.querySelector("[data-cinematic-canvas]");

if (sceneRoot && canvas) {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: 0, y: 0 };
  const scrollState = { y: 0 };

  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
    pointer.y = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
  }, { passive: true });

  window.addEventListener("scroll", () => {
    scrollState.y = window.scrollY || 0;
  }, { passive: true });

  const loadThree = async () => {
    const timeout = new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("Three.js load timed out")), 2400);
    });

    return Promise.race([
      import("https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js"),
      timeout
    ]);
  };

  loadThree()
    .then((THREE) => installThreeScene(THREE))
    .catch(() => installCanvasFallback());

  function fitCanvas(renderer) {
    const rect = sceneRoot.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(320, Math.floor(rect.height));

    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      renderer.setSize(width, height, false);
    } else {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      return ratio;
    }

    return width / height;
  }

  function installThreeScene(THREE) {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.15, 6);

    const group = new THREE.Group();
    scene.add(group);

    const ambient = new THREE.AmbientLight(0xffffff, 0.68);
    const keyLight = new THREE.PointLight(0xf0bd55, 34, 18);
    const coolLight = new THREE.PointLight(0x4ea4ff, 16, 16);
    keyLight.position.set(-3, 2.4, 4);
    coolLight.position.set(3.2, -1.8, 3.5);
    scene.add(ambient, keyLight, coolLight);

    const coinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x101114,
      metalness: 0.72,
      roughness: 0.28,
      clearcoat: 0.65,
      clearcoatRoughness: 0.2
    });
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc7922f,
      metalness: 0.9,
      roughness: 0.22
    });

    const coin = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.16, 96), coinMaterial);
    coin.rotation.x = Math.PI / 2;
    group.add(coin);

    const edge = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.028, 14, 120), edgeMaterial);
    group.add(edge);

    const markCanvas = document.createElement("canvas");
    markCanvas.width = 256;
    markCanvas.height = 256;
    const mark = markCanvas.getContext("2d");
    mark.clearRect(0, 0, 256, 256);
    mark.fillStyle = "#ffffff";
    mark.font = "900 150px Arial, sans-serif";
    mark.textAlign = "center";
    mark.textBaseline = "middle";
    mark.save();
    mark.translate(128, 134);
    mark.rotate(-0.18);
    mark.fillText("B", 128 - 128, 0);
    mark.fillRect(82 - 128, -74, 14, 148);
    mark.fillRect(162 - 128, -74, 14, 148);
    mark.restore();

    const texture = new THREE.CanvasTexture(markCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const logo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.92
    }));
    logo.scale.set(1.52, 1.52, 1);
    logo.position.set(0, 0, 0.12);
    group.add(logo);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x5e83c7,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });

    [1.65, 2.05, 2.48].forEach((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.01, 8, 180), ringMaterial.clone());
      ring.material.opacity = 0.22 - index * 0.045;
      ring.rotation.set(Math.PI / 2 + index * 0.18, index * 0.32, index * 0.12);
      group.add(ring);
    });

    const particleCount = 220;
    const positions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 9;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 5.2;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 5;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
      color: 0xd9b76a,
      size: 0.018,
      transparent: true,
      opacity: 0.52
    }));
    scene.add(particles);

    function resize() {
      camera.aspect = fitCanvas(renderer);
      camera.updateProjectionMatrix();
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    if (window.gsap && !prefersReducedMotion) {
      window.gsap.to(group.rotation, {
        y: Math.PI * 2,
        duration: 32,
        ease: "none",
        repeat: -1
      });
    }

    sceneRoot.dataset.cinemaEngine = "three";
    let frame = 0;

    function render() {
      frame += 1;
      const time = frame * 0.016;
      const scrollProgress = Math.min(scrollState.y / 900, 1);

      group.rotation.x += ((-pointer.y * 0.08) - group.rotation.x) * 0.035;
      group.rotation.z += ((pointer.x * 0.08) - group.rotation.z) * 0.035;
      if (!window.gsap) group.rotation.y += prefersReducedMotion ? 0 : 0.0028;

      particles.rotation.y = time * 0.025;
      particles.rotation.x = pointer.y * 0.045;
      camera.position.z = 6 - scrollProgress * 0.45;
      camera.position.x += (pointer.x * 0.12 - camera.position.x) * 0.04;
      camera.position.y += (-pointer.y * 0.08 + 0.15 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      if (!prefersReducedMotion) requestAnimationFrame(render);
    }

    render();
  }

  function installCanvasFallback() {
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const particles = Array.from({ length: 96 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.0018 + 0.0005
    }));

    let ratio = fitCanvas();
    sceneRoot.dataset.cinemaEngine = "canvas";

    window.addEventListener("resize", () => {
      ratio = fitCanvas();
    }, { passive: true });

    function draw() {
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);

      const shiftX = pointer.x * width * 0.04;
      const shiftY = pointer.y * height * 0.03;
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(199, 146, 47, 0.26)");
      gradient.addColorStop(0.45, "rgba(49, 91, 159, 0.16)");
      gradient.addColorStop(1, "rgba(44, 131, 117, 0.22)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(width * 0.74 + shiftX, height * 0.52 + shiftY);
      context.rotate(pointer.x * 0.08);
      context.strokeStyle = "rgba(240, 189, 85, 0.36)";
      context.lineWidth = Math.max(1, ratio);
      [0.82, 1, 1.2].forEach((scale) => {
        context.beginPath();
        context.ellipse(0, 0, width * 0.14 * scale, width * 0.14 * scale, 0, 0, Math.PI * 2);
        context.stroke();
      });
      context.fillStyle = "rgba(10, 12, 16, 0.9)";
      context.beginPath();
      context.ellipse(0, 0, width * 0.11, width * 0.11, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();

      context.fillStyle = "rgba(246, 243, 234, 0.58)";
      particles.forEach((particle) => {
        particle.y -= particle.speed;
        if (particle.y < -0.06) particle.y = 1.06;
        const x = particle.x * width + shiftX * particle.z;
        const y = particle.y * height + shiftY * particle.z;
        const size = Math.max(1, particle.z * ratio * 1.6);
        context.fillRect(x, y, size, size);
      });

      if (!prefersReducedMotion) requestAnimationFrame(draw);
    }

    draw();
  }
}
