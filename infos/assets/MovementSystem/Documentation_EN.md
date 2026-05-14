# Movement Systems Documentation

Welcome to the **HK Productions Movement Systems**! This package provides four distinct, beginner-friendly movement systems for Unity, supporting both **Keyboard** and **Gamepad** out of the box using the New Input System.

## Table of Contents
1. [General Features](#general-features)
2. [First Person Movement](#1-first-person-movement)
3. [2D Movement](#2-2d-movement)
4. [Third Person Movement](#3-third-person-movement)
5. [Top-Down Movement](#4-top-down-movement)
6. [Setup Guide](#setup-guide)
7. [Variable Reference](#variable-reference)

---

## General Features
All systems share several core functionalities:
- **Dual Input Support**: Full support for Keyboard/Mouse and Gamepad.
- **Auto-Setup**: Many components (like Cameras) are automatically detected or set up on Awake.
- **Sprinting**: Toggle between walking and sprinting speeds (with a `defaultRun` option).
- **Jumping**: Customizable jump height and optional **Double Jump**.
- **Camera Collision**: 3D systems include sphere-cast based camera collision to prevent clipping through walls.

---

## 1. First Person Movement
A classic First-Person Controller using a `CharacterController`.
- **Look System**: Smooth camera rotation with configurable limits.
- **Camera Setup**: Automatically finds `Main Camera` or a child named `PlayerCam`.
- **Movement**: Strafe and move forward/backward relative to the player's view.

## 2. Site Scroller Movement
A physics-based movement system for Side-Scrollers using `Rigidbody2D`.
- **Advanced Jumping**: Includes **Coyote Time** (jump shortly after leaving a platform) and **Jump Buffer** (stores jump inputs shortly before landing).
- **Smooth Follow Camera**: Features a custom camera follower that decouples from the player's rotation.
- **Automatic Flipping**: The character automatically flips its local scale based on movement direction.

## 3. Third Person Movement
An orbit-style movement system where the camera rotates around the player.
- **Orbit Camera**: Rotate the camera around the player using the mouse or right stick.
- **Zoom System**: Use the scroll wheel to zoom in and out.
- **Movement**: The player rotates smoothly towards the direction of movement relative to the camera view.

## 4. Top-Down Movement
Ideal for ARPGs or Twin-Stick Shooters. (still works in 2D and 3D mode)
- **Dual Rotation**: Rotate towards the mouse cursor or the Gamepad's right stick.
- **Fixed-Angle Camera**: A top-down camera with adjustable height and angle.
- **Zoom System**: Scroll to adjust the camera's view distance.

---

## Setup Guide
Follow these steps to get started with any of the systems:

1. **Add Component**: Attach one of the movement scripts (e.g., `FirstPersonMovement`) to your Player GameObject.
2. **Component Requirements**:
    - **3D Systems**: Automatically add a `CharacterController`.
    - **2D System**: Automatically adds a `Rigidbody2D`.
3. **Camera Setup**: 
    - Create a child Transform named `LookAt` (for 3D systems) to define where the camera should focus.
    - Create a child Transform named `PlayerCam` if you want a specific camera object to be used (e.g., for Cinemachine); otherwise, the script will use `Camera.main`.

---

## Variable Reference

### Movement Settings
- **Walk Speed / Sprint Speed**: How fast the character moves.
- **Default Run**: If enabled, the player runs by default and walks while holding the sprint key.
- **Double Jump Available**: Enables/disables the ability to jump a second time in mid-air.
- **Jump Height / Force**: Controls how high the character can jump.
- **Gravity**: Custom gravity scale for the movement system.

### Camera Settings
- **Look Speed / Sensitivity**: How fast the camera rotates.
- **Camera Offset**: The distance and position of the camera relative to the player.
- **Camera Obstruction Layers**: Which layers should block the camera (prevent clipping).
- **Smooth Time (2D)**: How quickly the camera catches up to the player.

### 2D Specific
- **Coyote Time**: Grace period for jumping after falling off a ledge.
- **Jump Buffer Time**: Period where a jump input is saved before hitting the ground.
- **Ground Layer**: Which layers the script considers "walkable".
