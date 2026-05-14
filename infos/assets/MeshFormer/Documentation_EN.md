# MeshFormer Documentation

**MeshFormer** is a powerful Unity tool designed for real-time mesh deformation (sculpting) and texture painting, both in the Unity Editor and at Runtime.

---

## 🚀 Getting Started

### Requirements
To use MeshFormer on an object, it requires the following components:
- **MeshFormer**: The core logic script.
- **Mesh Collider**: Required for raycasting and vertex interaction.
- **Subdivide**: Allows increasing mesh resolution for finer details.
- **Wireframe**: Provides visual feedback during sculpting.

### Installation
1. Drag the `MeshFormer.cs` script onto any GameObject with a `MeshFilter` or `SkinnedMeshRenderer` (or a parent of these).
2. The required components (`MeshCollider`, `Subdivide`, `Wireframe`) will be added automatically.

---

## 🛠 Editor Usage

In the Inspector, you will find three main modes:

### 1. Off Mode
Standard state. No mesh manipulation is active.

### 2. Sculpt Mode
Allows you to deform the mesh using a brush.
- **Left Click**: Deform the mesh along the vertex normals.
- **Invert Deform**: Pulls vertices inward instead of outward.
- **Smooth Mode**: Evens out vertex positions to create a smoother surface.
- **Brush Settings**: Adjust **Radius** (size) and **Strength** (intensity) of the deformation.
- **Wireframe Settings**: Toggle the wireframe overlay or the base mesh visibility to see your changes clearly.

### 3. Paint Mode
Allows direct painting onto the object's texture.
- **Left Click & Drag**: Paint on the texture using the selected **Paint Color**.
- **Texture Size**: Define the resolution for new textures (e.g., 1024, 2048).
- **Create New Texture**: Generates a blank canvas if no texture exists.

### Subdivision
Located under "Model Actions":
- **Subdivide Plus**: Increases the number of triangles for higher detail.
- **Subdivide Minus**: Reverts to the previous subdivision level.

### Saving
- **Save Mesh**: Saves the deformed mesh as a `.asset` file in your project.
- **Save Texture**: Saves the painted texture as a `.png` file.

---

## 🎮 Runtime Usage

### MeshFormerRuntimeManager
Use this component to enable sculpting and painting during gameplay.
1. Place the `MeshFormerRuntimeManager` on a GameObject in your scene.
2. It will automatically detect and manage `MeshFormer` components on its children.
3. It provides an `OrbitCamera` for easy navigation.

### Runtime Controls
- **Left Mouse Button**: Sculpt or Paint (depending on active mode).
- **Left Shift**: Hold to enable **Smooth Mode**.
- **Left Ctrl**: Hold to **Invert Deform**.

---

## 💡 Components Overview

- **MeshFormer.cs**: Manages the vertex manipulation and painting logic.
- **MeshFormerRuntimeManager.cs**: Handles runtime inputs and child object synchronization.
- **Subdivide.cs**: Implements a simple triangle-split subdivision algorithm.
- **Wireframe.cs**: Uses a custom shader to display the mesh topology.
- **MeshFormerOrbitCamera.cs**: A simple camera script for rotating around the target.

---

## 📝 Tips & Best Practices
- **Read/Write Enabled**: Ensure that "Read/Write" is enabled in the Import Settings of your Mesh assets.
- **Performance**: High subdivision levels can impact performance. Save frequently and avoid over-subdividing large meshes.
- **Colliders**: The tool automatically updates the `MeshCollider` after deformation so physics remains accurate.

---
*Developed by HK Productions*
