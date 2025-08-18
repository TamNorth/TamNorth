import * as THREE from "three";
import { GUI } from "lil-gui";
// import { Rapier, getRapier } from "./physics/rapier";

export default class Engine {
  public config = {
    debug: false,
  };
  public readonly cursor = {
    x: 0,
    y: 0,
    wheel: 0,
  };
  public gui: GUI | undefined;
  public guiFolders = {};
  public sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  private canvas: HTMLElement | undefined;
  private clock = new THREE.Clock();

  constructor() {
    this.cursor = {
      x: 0,
      y: 0,
      wheel: 0,
    };
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.renderer = this.createRenderer();
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;
  }

  public animate(tick: () => void) {
    const elapsedTime = this.clock.getElapsedTime();
    if (tick) {
      tick();
    }
    this.render();
    window.requestAnimationFrame(this.animate);
  }

  public attach(canvas: HTMLElement) {
    this.config = {
      debug: window.location.hash === "#debug",
    };
    if (this.config.debug) {
      this.enableDebug();
    }
    this.canvas = canvas;
    this.renderer = this.createRenderer();

    window.addEventListener("resize", () => {
      console.log("!");

      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    window.addEventListener("mousemove", (event) => {
      this.cursor.x = event.clientX / this.sizes.width - 0.5;
      this.cursor.y = -(event.clientY / this.sizes.height - 0.5);
    });

    window.addEventListener("wheel", (event) => {
      this.cursor.wheel = event.deltaY / 238;
    });

    this.scene.add(this.camera);
  }

  private createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    renderer.setSize(this.sizes.width, this.sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 2));

    return renderer;
  }

  public enableDebug() {
    this.gui = new GUI();
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
