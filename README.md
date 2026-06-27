# 🌌 StellarMind

**StellarMind** is a breathtaking, sci-fi inspired infinite canvas application designed to map your thoughts, ideas, and knowledge as "stars" in an expansive cosmic universe. Create nodes, link them to form constellations, and explore your mind map through a deeply immersive, desktop-first experience.

---

## ✨ Features

- 🔭 **Infinite Cosmic Canvas**: Pan and zoom limitlessly across the universe to organize your thoughts without spatial boundaries.
- ✨ **3D Parallax Starfield**: A multi-layered, mathematically generated background starfield that moves at different speeds to create a stunning illusion of 3D depth as you pan.
- 🎶 **Web Audio API Sound Engine**: Synthesized on-the-fly sound effects for every interaction (hover blips, sci-fi chimes, low-frequency buzzes, and harmonic link sweeps) without relying on external audio files.
- 💎 **Glassmorphism Interface**: A sleek, translucent, high-tech HUD (Heads Up Display) interface designed with vanilla CSS.
- 📝 **Markdown Native**: Write and format your node contents using Markdown. Includes a quick-insert toolbar for bold, italic, lists, and images.
- 📸 **Cosmic Photography**: Take high-quality PNG screenshots of your entire constellation with a single click (powered by `html2canvas`).
- 💾 **Local Auto-Save & Export**: Your universe is automatically saved to LocalStorage. You can also export your raw graph data as JSON and import it later.
- 🖥️ **Desktop Exclusive**: Enforces a strict large-screen requirement, blocking small mobile devices to guarantee the best possible immersive experience.

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (No heavy CSS frameworks, highly optimized custom animations)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: [React Markdown](https://github.com/remarkjs/react-markdown)
- **Audio**: Native Web Audio API

## 🚀 Getting Started

To launch StellarMind on your local machine, ensure you have Node.js installed, then follow these steps:

### 1. Clone the repository
```bash
git clone git@github.com:luckywirasakti/STELLARMIND.git
cd stellarmind
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

### 4. Explore the Universe
Open your browser and navigate to `http://localhost:5173/` (or the port provided by Vite).

---

## 🎮 Controls

- **Pan/Move**: Click and drag on any empty space.
- **Zoom**: Scroll your mouse wheel or trackpad.
- **Select Star**: Click on any star to open the Star Console (editor).
- **Create Star**: Click the "Create Star" button in the bottom HUD.
- **Connect Stars**: 
  1. Switch to **Link Mode** in the HUD.
  2. Click and hold the small crosshair handle at the top-right of a selected star.
  3. Drag the pulsing line to another star to form a connection.
- **Reset View**: Automatically calculates the center of mass of your entire constellation and centers the camera on it.

## 📄 License

This project is open-source. Feel free to fork, modify, and build your own universe!
