import { Application, Assets, Sprite, Graphics, Text, TextStyle, Container } from 'pixi.js';
import { CITY_POSITIONS, ADJACENCY, isPlayableCity } from '@barbarossa/game-engine';

/** Positions calibrated as % of the 0_Big.png map image */
const POSITIONS = CITY_POSITIONS;

const FACTION_COLORS: Record<string, number> = {
  barbarossa: 0xd4a017,
  lega: 0x2e8b57,
};

export class MapRenderer {
  private app: Application;
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private mapSprite: Sprite | null = null;
  private cityContainer = new Container();
  private unitContainer = new Container();
  private lineGraphics = new Graphics();
  private resizeObserver: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, container: HTMLElement) {
    this.canvas = canvas;
    this.container = container;
    this.app = new Application();
  }

  async init(): Promise<void> {
    await this.app.init({
      canvas: this.canvas,
      resizeTo: this.container,
      background: 0x0a0a1a,
      antialias: true,
    });

    // Load map texture
    const mapTexture = await Assets.load('/assets/Mappa/0_Big.png');
    this.mapSprite = new Sprite(mapTexture);
    this.app.stage.addChild(this.mapSprite);

    // Layers
    this.app.stage.addChild(this.lineGraphics);
    this.app.stage.addChild(this.cityContainer);
    this.app.stage.addChild(this.unitContainer);

    this.fitMap();
    this.drawAdjacencyLines();
    this.drawCityPins();

    // Responsive resize
    this.resizeObserver = new ResizeObserver(() => {
      this.fitMap();
      this.drawAdjacencyLines();
      this.drawCityPins();
    });
    this.resizeObserver.observe(this.container);
  }

  private fitMap(): void {
    if (!this.mapSprite) return;
    const { width: cw, height: ch } = this.container.getBoundingClientRect();
    const scale = Math.min(cw / this.mapSprite.texture.width, ch / this.mapSprite.texture.height);
    this.mapSprite.scale.set(scale);
    this.mapSprite.x = (cw - this.mapSprite.width) / 2;
    this.mapSprite.y = (ch - this.mapSprite.height) / 2;
  }

  private toScreen(city: string): { x: number; y: number } | null {
    const pos = POSITIONS[city as keyof typeof POSITIONS];
    if (!pos || !this.mapSprite) return null;
    return {
      x: this.mapSprite.x + (pos.left / 100) * this.mapSprite.width,
      y: this.mapSprite.y + (pos.top / 100) * this.mapSprite.height,
    };
  }

  private drawAdjacencyLines(): void {
    this.lineGraphics.clear();
    const drawn = new Set<string>();

    for (const [city, neighbors] of Object.entries(ADJACENCY)) {
      const from = this.toScreen(city);
      if (!from) continue;

      for (const neighbor of neighbors) {
        const key = [city, neighbor].sort().join('-');
        if (drawn.has(key)) continue;
        drawn.add(key);

        const to = this.toScreen(neighbor);
        if (!to) continue;

        this.lineGraphics.moveTo(from.x, from.y);
        this.lineGraphics.lineTo(to.x, to.y);
        this.lineGraphics.stroke({ width: 1.5, color: 0x444466, alpha: 0.6 });
      }
    }
  }

  private drawCityPins(): void {
    this.cityContainer.removeChildren();

    const labelStyle = new TextStyle({
      fontSize: 11,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: { color: 0x000000, distance: 1, blur: 2 },
    });

    for (const [city] of Object.entries(POSITIONS)) {
      const screen = this.toScreen(city);
      if (!screen) continue;

      // Pin circle
      const g = new Graphics();
      g.circle(0, 0, isPlayableCity(city) ? 8 : 6);
      g.fill({ color: isPlayableCity(city) ? 0xcccccc : 0x888888 });
      g.x = screen.x;
      g.y = screen.y;
      this.cityContainer.addChild(g);

      // Label
      const label = new Text({ text: city, style: labelStyle });
      label.anchor.set(0.5, 1.3);
      label.x = screen.x;
      label.y = screen.y;
      this.cityContainer.addChild(label);
    }
  }

  update(gameState: Record<string, unknown>): void {
    this.unitContainer.removeChildren();
    const cities = gameState.cities as Record<string, unknown> | undefined;
    if (!cities) return;

    for (const [cityName, cityData] of Object.entries(cities)) {
      const screen = this.toScreen(cityName);
      if (!screen) continue;

      const city = cityData as { controlledBy?: string; units?: Array<{ faction: string; type: string; count: number }> };

      // Control ring
      if (city.controlledBy) {
        const ring = new Graphics();
        ring.circle(0, 0, 12);
        ring.stroke({ width: 3, color: FACTION_COLORS[city.controlledBy] ?? 0xffffff });
        ring.x = screen.x;
        ring.y = screen.y;
        this.unitContainer.addChild(ring);
      }

      // Unit dots
      if (city.units) {
        let offset = 0;
        for (const unit of city.units) {
          for (let i = 0; i < unit.count; i++) {
            const dot = new Graphics();
            dot.circle(0, 0, 4);
            dot.fill({ color: FACTION_COLORS[unit.faction] ?? 0xffffff });
            dot.x = screen.x + 16 + offset * 10;
            dot.y = screen.y;
            this.unitContainer.addChild(dot);
            offset++;
          }
        }
      }
    }
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.app.destroy(true);
  }
}
