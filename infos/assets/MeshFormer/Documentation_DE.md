# MeshFormer Dokumentation

**MeshFormer** ist ein leistungsstarkes Unity-Tool für die Echtzeit-Mesh-Deformation (Sculpting) und Texturmalerei, sowohl im Unity-Editor als auch zur Laufzeit (Runtime).

---

## 🚀 Erste Schritte

### Anforderungen
Um MeshFormer auf einem Objekt zu verwenden, sind folgende Komponenten erforderlich:
- **MeshFormer**: Das Hauptskript für die Logik.
- **Mesh Collider**: Erforderlich für Raycasting und Vertex-Interaktion.
- **Subdivide**: Erlaubt das Erhöhen der Mesh-Auflösung für feinere Details.
- **Wireframe**: Bietet visuelles Feedback während des Sculptings.

### Installation
1. Ziehe das `MeshFormer.cs` Skript auf ein beliebiges GameObject mit einem `MeshFilter` oder `SkinnedMeshRenderer` (oder ein Parent davon).
2. Die erforderlichen Komponenten (`MeshCollider`, `Subdivide`, `Wireframe`) werden automatisch hinzugefügt.

---

## 🛠 Nutzung im Editor

Im Inspector finden Sie drei Hauptmodi:

### 1. Off Mode (Aus)
Standardzustand. Es ist keine Mesh-Manipulation aktiv.

### 2. Sculpt Mode (Bildhauen)
Ermöglicht das Verformen des Meshes mit einem Pinsel.
- **Linksklick**: Verformt das Mesh entlang der Vertex-Normalen.
- **Invert Deform**: Zieht Vertices nach innen statt nach außen.
- **Smooth Mode**: Gleicht Vertex-Positionen an, um eine glattere Oberfläche zu erzeugen.
- **Pinsel-Einstellungen**: Passen Sie **Radius** (Größe) und **Strength** (Stärke) der Deformation an.
- **Wireframe-Einstellungen**: Schalten Sie das Wireframe-Overlay oder die Sichtbarkeit des Basis-Meshes um, um Ihre Änderungen klar zu sehen.

### 3. Paint Mode (Malen)
Ermöglicht das direkte Malen auf der Textur des Objekts.
- **Linksklick & Ziehen**: Malen Sie auf der Textur mit der gewählten **Paint Color**.
- **Texture Size**: Legen Sie die Auflösung für neue Texturen fest (z. B. 1024, 2048).
- **Create New Texture**: Erzeugt eine leere Leinwand, falls keine Textur vorhanden ist.

### Unterteilung (Subdivision)
Zu finden unter "Model Actions":
- **Subdivide Plus**: Erhöht die Anzahl der Dreiecke für mehr Details.
- **Subdivide Minus**: Kehrt zur vorherigen Unterteilungsstufe zurück.

### Speichern
- **Save Mesh**: Speichert das verformte Mesh als `.asset` Datei in Ihrem Projekt.
- **Save Texture**: Speichert die bemalte Textur als `.png` Datei.

---

## 🎮 Nutzung zur Laufzeit (Runtime)

### MeshFormerRuntimeManager
Verwenden Sie diese Komponente, um Sculpting und Painting während des Spiels zu ermöglichen.
1. Platzieren Sie den `MeshFormerRuntimeManager` auf einem GameObject in Ihrer Szene.
2. Er erkennt und verwaltet automatisch `MeshFormer` Komponenten auf seinen Kind-Objekten.
3. Er bietet eine `OrbitCamera` für einfache Navigation.

### Steuerung zur Laufzeit
- **Linke Maustaste**: Sculpten oder Malen (je nach aktivem Modus).
- **Linke Umschalttaste (Shift)**: Halten für **Smooth Mode**.
- **Linke Strg-Taste (Ctrl)**: Halten für **Invert Deform**.

---

## 💡 Komponenten-Übersicht

- **MeshFormer.cs**: Verwalte die Vertex-Manipulation und Mal-Logik.
- **MeshFormerRuntimeManager.cs**: Handhabt Eingaben zur Laufzeit und Synchronisation von Kind-Objekten.
- **Subdivide.cs**: Implementiert einen einfachen Subdivision-Algorithmus (Triangle-Split).
- **Wireframe.cs**: Nutzt einen speziellen Shader, um die Mesh-Topologie anzuzeigen.
- **MeshFormerOrbitCamera.cs**: Ein einfaches Kamera-Skript zum Rotieren um das Ziel.

---

## 📝 Tipps & Best Practices
- **Read/Write Aktiviert**: Stellen Sie sicher, dass "Read/Write" in den Import-Einstellungen Ihrer Mesh-Assets aktiviert ist.
- **Performance**: Hohe Subdivision-Stufen können die Leistung beeinträchtigen. Speichern Sie regelmäßig und vermeiden Sie zu starke Unterteilung bei großen Meshes.
- **Collider**: Das Tool aktualisiert den `MeshCollider` automatisch nach der Deformation, damit die Physik akkurat bleibt.

---
*Entwickelt von HK Productions*
