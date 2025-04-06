import { LightSourceConfig } from './token-flashlight-config.js';

export const MODULE_ID = 'token-flashlight';

const DEFAULT_LIGHT_SOURCES = {
  "bullseyeLantern": {
    name: "Bullseye Lantern",
    dim: 120,
    bright: 60,
    color: "#f8c377",
    angle: 60,
    animation: {
      type: "torch",
      speed: 5,
      intensity: 5
    },
    resource: {
      item: "Oil",
      cost: 1
    }
  },
  "candle": {
    name: "Candle",
    dim: 10,
    bright: 5,
    color: "#f8c377",
    angle: 360,
    animation: {
      type: "torch",
      speed: 3,
      intensity: 3
    },
    resource: {
      item: "Candle",
      cost: 1
    }
  },
  "hoodedLanternBright": {
    name: "Hooded Lantern (Bright)",
    dim: 60,
    bright: 30,
    color: "#f8c377",
    angle: 360,
    animation: {
      type: "torch",
      speed: 5,
      intensity: 4
    },
    resource: {
      item: "Oil",
      cost: 1
    }
  },
  "hoodedLanternDim": {
    name: "Hooded Lantern (Dim)",
    dim: 5,
    bright: 0,
    color: "#f8c377",
    angle: 360,
    animation: {
      type: "torch",
      speed: 3,
      intensity: 2
    },
    resource: {
      item: "Oil",
      cost: 1
    }
  },
  "lamp": {
    name: "Lamp",
    dim: 45,
    bright: 15,
    color: "#f8c377",
    angle: 360,
    animation: {
      type: "torch",
      speed: 4,
      intensity: 4
    },
    resource: {
      item: "Oil",
      cost: 1
    }
  },
  "lightCantrip": {
    name: "Light Cantrip",
    dim: 40,
    bright: 20,
    color: "#ffffff",
    angle: 360,
    animation: {
      type: "none",
      speed: 5,
      intensity: 5
    },
    resource: {
      item: "",
      cost: 0
    }
  },
  "moonTouched": {
    name: "Moon Touched",
    dim: 15,
    bright: 0,
    color: "#c4f7ff",
    angle: 360,
    animation: {
      type: "none",
      speed: 5,
      intensity: 5
    },
    resource: {
      item: "",
      cost: 0
    }
  },
  "torch": {
    name: "Torch",
    dim: 40,
    bright: 20,
    color: "#f8c377",
    angle: 360,
    animation: {
      type: "torch",
      speed: 5,
      intensity: 5
    },
    resource: {
      item: "Torch",
      cost: 1
    }
  }
};

export function getLightSourceData() {
  const storedData = game.settings.get(MODULE_ID, 'lightSource') || {};
  
  return Object.fromEntries(
    Object.entries(DEFAULT_LIGHT_SOURCES).map(([id, defaultSource]) => {
      const storedSource = storedData[id] || {};
      return [id, {
        ...defaultSource,
        ...storedSource,
        name: defaultSource.name,
        animation: { ...defaultSource.animation, ...storedSource.animation },
        resource: { ...defaultSource.resource, ...storedSource.resource }
      }];
    })
  );
}

Hooks.once('init', async function() {
  game.settings.register(MODULE_ID, 'consumeResourceByDefault', {
    name: "Consume Resource by Default",
    hint: "If checked, the 'Consume Resource' option in the Token Flashlight dialog will be checked by default.",
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, 'lightSource', {
    name: "Light Sources",
    hint: "Configuration data for all light sources.",
    scope: 'world',
    config: false,
    type: Object,
    default: {}
  });
});

Hooks.once('ready', async function() {
  const existingSettings = game.settings.get(MODULE_ID, 'lightSource');
  if (!existingSettings || Object.keys(existingSettings).length === 0) {
    await game.settings.set(MODULE_ID, 'lightSource', {});
  }
  
  Object.keys(DEFAULT_LIGHT_SOURCES).forEach(id => {
    const source = DEFAULT_LIGHT_SOURCES[id];
    game.settings.registerMenu(MODULE_ID, `configure-${id}`, {
      name: source.name,
      hint: `Configure the properties of the ${source.name} light source.`,
      label: "Configure",
      icon: "fas fa-cog",
      type: class LightSourceConfigWrapper extends FormApplication {
        constructor(options) {
          super(options);
          this.lightSourceId = id;
        }
        
        render() {
          const lightSources = getLightSourceData();
          const sourceData = lightSources[this.lightSourceId];
          new LightSourceConfig(this.lightSourceId, sourceData).render(true);
          return null;
        }
      },
      restricted: true
    });
  });
  
  game.modules.get(MODULE_ID).api = {
    getLightSourceData
  };
});

class TokenFlashlightDialog extends Dialog {
  constructor(tokens) {
    const lightSources = getLightSourceData();
    const consumeResourceDefault = game.settings.get(MODULE_ID, 'consumeResourceByDefault');
    
    const buttons = [
      ...Object.entries(lightSources).map(([id, config]) => ({ 
        action: id, 
        label: config.name 
      })),
      { action: "cancel", label: "Cancel", className: "cancel-button" }
    ];

    const dialogContent = `
      <form>
        <div class="flashlight-buttons-grid">
          ${buttons.map(btn => 
            `<button type="button" data-action="${btn.action}" class="flashlight-button ${btn.className || ''}">
              ${btn.label}
            </button>`
          ).join('')}
        </div>
        <div class="form-group" style="margin-top: 10px;">
          <label><input type="checkbox" name="consumeResource" ${consumeResourceDefault ? 'checked' : ''}> Consume Resource</label>
        </div>
      </form>
    `;

    super({
      title: "Token Flashlight",
      content: dialogContent,
      buttons: {},
      default: "cancel"
    });

    this.tokens = tokens;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.flashlight-button').click(this._onButtonClick.bind(this));
  }

  _onButtonClick(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;
    const consumeResource = this.element.find('[name="consumeResource"]').prop('checked');
    
    if (action !== "cancel") {
      applyLightSource(this.tokens, action, consumeResource);
    }
    this.close();
  }
}

Hooks.on('getSceneControlButtons', controls => {
  const tokenTools = controls.find(c => c.name === "token");
  if (!tokenTools) return;

  tokenTools.tools.push({
    name: "flashlight",
    title: "Token Flashlight",
    icon: "fas fa-flashlight",
    visible: true,
    onClick: () => {
      const selectedTokens = canvas.tokens.controlled;
      if (!selectedTokens.length) return;

      const hasLight = selectedTokens.some(token => 
        token.document.light.dim > 0 || token.document.light.bright > 0
      );
      
      if (hasLight) {
        const noLight = {
          dim: 0, bright: 0, angle: 360, color: "", alpha: 0.5,
          animation: { type: "", speed: 5, intensity: 5 }
        };
        selectedTokens.forEach(token => token.document.update({ light: noLight }));
      } else {
        new TokenFlashlightDialog(selectedTokens).render(true);
      }
    },
    button: true
  });
});

export function applyLightSource(tokens, lightSourceId, consumeResource = false) {
  const lightSources = getLightSourceData();
  const source = lightSources[lightSourceId];
  
  if (!source) return;

  const tokensWithResources = [];
  const tokensWithoutResources = [];
  
  if (consumeResource && source.resource.item && source.resource.cost > 0) {
    tokens.forEach(token => {
      const actor = token.actor;
      if (!actor) {
        tokensWithoutResources.push({
          token,
          reason: "No actor"
        });
      } else {
        try {
          const item = actor.items.find(i => i.name === source.resource.item);
          if (!item || item.system.quantity < source.resource.cost) {
            tokensWithoutResources.push({
              token,
              reason: !item ? `Missing ${source.resource.item}` : `Insufficient ${source.resource.item} (has ${item.system.quantity}, needs ${source.resource.cost})`
            });
          } else {
            tokensWithResources.push(token);
          }
        } catch (error) {
          console.error(`Failed to process resources for ${token.name}:`, error);
          tokensWithoutResources.push({
            token,
            reason: "Error checking resources"
          });
        }
      }
    });
  } else {
    tokensWithResources.push(...tokens);
  }

  if (tokensWithoutResources.length > 0) {
    const warningMessage = `The following tokens lack the required resource: ` +
      `${tokensWithoutResources.map(t => t.token.name).join(', ')}`;
    ui.notifications.warn(warningMessage, {permanent: true});
  }

  for (const token of tokensWithResources) {
    try {
      if (consumeResource && source.resource.item && source.resource.cost > 0) {
        const actor = token.actor;
        if (actor) {
          const item = actor.items.find(i => i.name === source.resource.item);
          if (item && item.system.quantity >= source.resource.cost) {
            item.update({ "system.quantity": item.system.quantity - source.resource.cost });
          }
        }
      }

      token.document.update({
        light: {
          dim: source.dim,
          bright: source.bright,
          color: source.color,
          angle: source.angle,
          alpha: 0.5,
          animation: {
            type: source.animation.type,
            speed: source.animation.speed,
            intensity: source.animation.intensity
          }
        }
      });
    } catch (error) {
      console.error(`Failed to update light for ${token.name}:`, error);
    }
  }
}
