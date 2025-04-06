import { MODULE_ID, getLightSourceData } from './token-flashlight.js';

export class LightSourceConfig extends FormApplication {
  constructor(lightSourceId, lightSource) {
    super({}, {});
    this.lightSourceId = lightSourceId;
    this.lightSource = lightSource;
    this.originalLightSource = duplicate(lightSource);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "light-source-config",
      title: "Configure Light Source",
      template: `modules/${MODULE_ID}/templates/light-source-config.html`,
      width: 400,
      height: "auto",
      closeOnSubmit: false
    });
  }

  getData() {
    return {
      title: `${this.lightSource.name}`,
      lightSourceId: this.lightSourceId,
      lightSource: this.lightSource,
      animationTypes: {
        "none": "None", "torch": "Torch", "pulse": "Pulse", "chroma": "Chroma", 
        "wave": "Wave", "fog": "Fog", "sunburst": "Sunburst", "dome": "Dome", 
        "emanation": "Emanation", "hexa": "Hexa", "ghost": "Ghost", 
        "energy": "Energy", "roiling": "Roiling", "hole": "Hole"
      }
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    html.find('input[type="range"]').on('input', (event) => {
      $(event.currentTarget).siblings('.range-value').text(event.currentTarget.value);
    });
    
    // Sync color picker and hex input
    html.find('input[name="color"]').on('input', (event) => {
      html.find('input[name="colorHex"]').val(event.currentTarget.value);
    });
    
    html.find('input[name="colorHex"]').on('input', (event) => {
      const hexValue = event.currentTarget.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
        html.find('input[name="color"]').val(hexValue);
      }
    });
    
    html.find('button[name="reset"]').click(this._onReset.bind(this));
    html.find('button[name="apply"]').click(this._onApply.bind(this));
    html.find('button[name="cancel"]').click(() => this.close());
  }
  
  async _onReset() {
    const settings = game.settings.get(MODULE_ID, 'lightSource') || {};
    
    if (settings[this.lightSourceId]) {
      delete settings[this.lightSourceId];
      await game.settings.set(MODULE_ID, 'lightSource', settings);
    }
    
    const lightSources = getLightSourceData();
    const defaultSource = lightSources[this.lightSourceId];
    
    if (defaultSource) {
      this.lightSource = duplicate(defaultSource);
      
      this.render(true);
    }
  }
  
  async _onApply() {
    try {
      const formData = new FormDataExtended(this.element.find('form')[0]).object;
      
      const update = {
        dim: Number(formData.dim),
        bright: Number(formData.bright),
        color: formData.color, // We'll continue using the color picker's value
        angle: Number(formData.angle),
        animation: {
          type: formData.animationType,
          speed: Number(formData.animationSpeed),
          intensity: Number(formData.animationIntensity)
        },
        resource: {
          item: formData.resourceItem,
          cost: Number(formData.resourceCost)
        }
      };
      
      const lightSources = game.settings.get(MODULE_ID, 'lightSource') || {};
      lightSources[this.lightSourceId] = foundry.utils.mergeObject(
        lightSources[this.lightSourceId] || {}, 
        update
      );
      
      await game.settings.set(MODULE_ID, 'lightSource', lightSources);
      this.close({applied: true});
    } catch (error) {
      console.error(`Failed to apply light source settings: ${error.message}`);
    }
  }

  async close(options={}) {
    if (!options.applied) {
      this.lightSource = this.originalLightSource;
    }
    return super.close(options);
  }
}