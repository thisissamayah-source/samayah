document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("dna-container");
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    // Perspective camera gives 3D depth. 
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 2. DNA Helix Geometry
    const particlesCount = 1200; // Dense particle field for high-end look
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const goldColor = new THREE.Color("#ffd700");
    const highlightColor = new THREE.Color("#ffffff");

    const helixLength = 100;
    const radius = 2.0;

    for (let i = 0; i < particlesCount; i++) {
        let t = i / particlesCount; 
        let x = (t - 0.5) * helixLength; // Spread across X axis (-50 to 50)
        
        // 12 full twists
        let angle = t * Math.PI * 24; 

        // Probability distribution: 35% strand 1, 35% strand 2, 30% base pair rungs
        let type = Math.random();
        let y, z;
        let isHighlight = Math.random() > 0.9;

        if (type < 0.35) {
            y = Math.sin(angle) * radius;
            z = Math.cos(angle) * radius;
        } else if (type < 0.70) {
            y = Math.sin(angle + Math.PI) * radius;
            z = Math.cos(angle + Math.PI) * radius;
        } else {
            // Base pair (rung) connecting the two strands
            let lerp = Math.random();
            let y1 = Math.sin(angle) * radius;
            let z1 = Math.cos(angle) * radius;
            let y2 = Math.sin(angle + Math.PI) * radius;
            let z2 = Math.cos(angle + Math.PI) * radius;
            
            y = y1 + (y2 - y1) * lerp;
            z = z1 + (z2 - z1) * lerp;
            isHighlight = false; // Rungs are slightly dimmer
        }

        // Add organic noise displacement
        y += (Math.random() - 0.5) * 0.4;
        z += (Math.random() - 0.5) * 0.4;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Assign colors (random glowing highlights)
        if (isHighlight) {
            colors[i * 3] = highlightColor.r;
            colors[i * 3 + 1] = highlightColor.g;
            colors[i * 3 + 2] = highlightColor.b;
        } else {
            colors[i * 3] = goldColor.r;
            colors[i * 3 + 1] = goldColor.g;
            colors[i * 3 + 2] = goldColor.b;
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create glowing point material
    const material = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending, // Core for glowing light effect
        depthWrite: false
    });

    const dnaSystem = new THREE.Points(geometry, material);
    scene.add(dnaSystem);

    // 3. Interactivity
    let targetRotationY = 0;
    let targetRotationZ = 0;
    let isHovering = false;

    container.addEventListener('mousemove', (e) => {
        isHovering = true;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Normalized coordinates (-1 to +1)
        const mouseX = (x / rect.width) * 2 - 1;
        const mouseY = -(y / rect.height) * 2 + 1;
        
        // Tilt helix dynamically based on mouse
        targetRotationY = mouseX * 0.3;
        targetRotationZ = mouseY * 0.2;
    });

    container.addEventListener('mouseleave', () => {
        isHovering = false;
        targetRotationY = 0;
        targetRotationZ = 0;
    });

    // 4. Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // 5. Animation Loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.005; // Base spin speed

        // Continuous biological spinning on the X axis
        dnaSystem.rotation.x = time * 2;

        // Smoothly interpolate rotations based on mouse hover
        dnaSystem.rotation.y += (targetRotationY - dnaSystem.rotation.y) * 0.05;
        dnaSystem.rotation.z += (targetRotationZ - dnaSystem.rotation.z) * 0.05;

        // Pulsing camera depth on hover
        const targetZ = isHovering ? 20 : 25;
        camera.position.z += (targetZ - camera.position.z) * 0.05;

        renderer.render(scene, camera);
    }

    animate();
});
