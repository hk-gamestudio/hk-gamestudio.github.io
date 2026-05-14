# SymbolCreator Documentation

Welcome to **SymbolCreator**, a Unity tool designed to simplify the management of *Scripting Define Symbols*. Whether you want to control symbols manually via a graphical interface or set them automatically via code, this asset provides a clean and efficient solution.

## Introduction

In Unity, *Scripting Define Symbols* are often used to enable or disable code blocks depending on the platform or specific conditions (using `#if SYMBOL`). By default, managing these in the Unity *Player Settings* can be cluttered and unintuitive.

**SymbolCreator** solves this problem by providing:
- A clear **Editor Interface** for quick management.
- A powerful **SymbolUtility** to control symbols programmatically.
- **Persistence**: Symbols remain in your list even if they are not currently active.

---

## SymbolUtility

The `SymbolUtility` is the core for developers. It allows you to manage symbols directly from your own scripts without having to manually open Unity settings.

### Usage in Code

To use the utility, you need to include the corresponding namespace:

```csharp
using HK.SymbolCreator.Utils;
```

#### Key Functions

Here are the three main functions you should know:

1. **Add Symbol**
   Adds a symbol to the current build target group if it doesn't already exist.
   ```csharp
   SymbolUtility.AddSymbol("MY_AWESOME_FEATURE");
   ```

2. **Remove Symbol**
   Safely removes a symbol from the list if it exists.
   ```csharp
   SymbolUtility.RemoveSymbol("MY_AWESOME_FEATURE");
   ```

3. **Check Symbol**
   Checks if a specific symbol is currently active.
   ```csharp
   if (SymbolUtility.HasSymbol("MY_AWESOME_FEATURE"))
   {
       Debug.Log("The feature is active!");
   }
   ```

### Why use SymbolUtility?
Imagine you want to write an asset that builds on another asset... 
but should also work on its own with an alternative, simplified solution. 
In this case, you simply set your symbol for the asset and can query it in other assets.

---

## The Editor (Symbol Creator)

For visual management, there is the **Symbol Creator**. It is particularly beginner-friendly and provides a clear overview of all known symbols.

### How to open the window
In the Unity menu, go to:  
**Tools -> HK-Productions -> SymbolCrator**

### User Interface Features

1. **Symbol List**: Here you can see all saved symbols.
   - **Green**: The symbol is active.
   - **Red**: The symbol is inactive (saved, but not active in the build).
   - **Grey**: This symbol is currently selected.
2. **Add (+)**: Use the plus icon to define new symbols.
3. **Toggle**: Turn selected symbols on or off with a single click.
4. **Remove**: Deletes symbols completely from your saved list.
5. **Clear Selection**: Deselects all current markings in the list.

### Language Support
The editor supports multiple languages (e.g., German and English), which you can easily switch via the dropdown menu at the top right.

### Workflow Tips
- **Bulk Actions**: You can select multiple symbols at once and activate or deactivate them all with the "Toggle" button.
- **Clean Code**: Use the symbols in your code like this:
  ```csharp
  #if MY_AWESOME_FEATURE
      // This code will only be compiled if the symbol is active.
      DoSomething();
  #endif
  ```

---

This asset is designed to fit seamlessly into any workflow – whether for small indie projects or large Asset Store packages.