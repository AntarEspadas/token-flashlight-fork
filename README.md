# Token Flashlight

A Foundry VTT module for applying preconfigured lighting effects to tokens on the game canvas.

![Version: 1.0.0](https://img.shields.io/badge/version-1.0.0-blue)
![Foundry: v12.331-13](https://img.shields.io/badge/foundry-v12.331--13-green)
![System: dnd5e](https://img.shields.io/badge/system-dnd5e-red)

## Description

Token Flashlight provides a simple yet powerful way to manage light sources for tokens in your Foundry VTT games. With a single click, you can apply preconfigured light effects to selected tokens and even track resource consumption automatically.

## Features

### Light Source Management
- Apply light effects to tokens directly from the token controls
- Toggle lights on and off with a single button
- Choose from a variety of preconfigured light sources

### Included Light Sources
- **Bullseye Lantern**: 60ft bright/120ft dim light in a 60° cone
- **Candle**: 5ft bright/10ft dim light
- **Hooded Lantern (Bright)**: 30ft bright/60ft dim light
- **Hooded Lantern (Dim)**: 5ft dim light
- **Lamp**: 15ft bright/45ft dim light
- **Light Cantrip**: 20ft bright/40ft dim magical light
- **Moon Touched**: 15ft dim magical glow
- **Torch**: 20ft bright/40ft dim light

### Resource Integration
- Automatically track and consume resources like oil, candles, and torches
- Optional resource consumption with clear warnings for tokens lacking required resources
- Configure resource costs for each light source

### Customization
- Fully configurable light sources with settings for:
  - Bright and dim light radius
  - Light color
  - Light angle
  - Animation type, speed, and intensity
  - Resource requirements

## Usage

1. Select one or more tokens on the canvas
2. Click the flashlight icon in the token controls
3. If tokens already have light, clicking the button will turn off all lights
4. If tokens have no light, a dialog will appear with available light sources
5. (Optional) Check "Consume Resource" to deduct the required item from token inventory
6. Click on the desired light source to apply it

## Configuration

### Light Sources
Each light source can be configured from the module settings:
1. Go to Game Settings → Module Settings → Token Flashlight
2. Click the "Configure" button next to any light source
3. Adjust settings such as light radius, color, animation, and resource costs
4. Click "Apply" to save changes

### Global Settings
- **Consume Resource by Default**: Toggle whether the "Consume Resource" option is checked by default

## API

Token Flashlight exposes an API for other modules or macros:

## Compatibility

- Requires Foundry VTT v12.331 or later
- Designed for use with the D&D 5e system

## License

This module is licensed under the terms included in the LICENSE file.

## Credits

Developed by [Conjectural Technologies](https://github.com/Conjectural-Technologies)