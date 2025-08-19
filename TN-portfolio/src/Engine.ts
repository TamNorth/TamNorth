import * as THREE from "three";
import { GUI } from "lil-gui";
import { type Rapier, getRapier } from "./physics/rapier";
import type { World } from "@dimforge/rapier3d";
import { Sky } from "three/addons/objects/Sky.js";

export default class Engine {
  public camera: THREE.PerspectiveCamera;
  public config = {
    debug: false,
  };
  public readonly cursor = {
    x: 0,
    y: 0,
    wheel: 0,
  };
  public gui: GUI | undefined;
  public guiFolders: { renderer?: any; sky?: any; lights?: any } = {};
  public physicsParams = {
    gravity: new THREE.Vector3(0, -9.81, 0),
  };
  public rapier!: Rapier;
  public renderer: THREE.WebGLRenderer;
  public scene = new THREE.Scene();
  public sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  private canvas: HTMLElement | undefined;
  private clock = new THREE.Clock();
  private sky: Sky | null = null;
  private world?: World;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.renderer = this.createRenderer();
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;

    this.scene.add(this.camera);
  }

  //   public animate(tick: () => void) {
  //     const elapsedTime = this.clock.getElapsedTime();
  //     if (tick) {
  //       tick();
  //     }
  //     this.render();
  //     window.requestAnimationFrame(this.animate);
  //   }

  public async attach(canvas: HTMLElement) {
    this.config = {
      debug: window.location.hash === "#debug",
    };
    if (this.config.debug) {
      this.enableDebug();
    }

    this.canvas = canvas;
    this.renderer = this.createRenderer();

    window.addEventListener("resize", () => {
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

    const rapier = (this.rapier = await getRapier());
    this.world = new rapier.World(this.physicsParams.gravity);
  }

  private createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    renderer.setSize(this.sizes.width, this.sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    if (this.config.debug && this.gui) {
      this.guiFolders.renderer
        .add(renderer, "toneMappingExposure")
        .min(0.1)
        .max(1)
        .step(0.01);
    }

    return renderer;
  }

  private createSky(scale = 100) {
    this.sky = new Sky();
    this.sky.scale.setScalar(scale);
    this.scene.add(this.sky);
  }

  public createSkybox(
    elevation: number,
    azimuth: number,
    _options?: {
      directionalLight?: boolean;
      hemisphereLight?: boolean;
      scale?: number;
    }
  ) {
    if (!this.sky) {
      this.createSky(_options?.scale);
    }

    const sunPosition = new THREE.Vector3();
    const radiansPerDegree = Math.PI / 180;
    const sunCoords = {
      elevation: elevation,
      azimuth: azimuth,
    };
    sunPosition.setFromSphericalCoords(
      1,
      Math.PI * 0.5 - sunCoords.elevation * radiansPerDegree,
      sunCoords.azimuth * radiansPerDegree
    );

    (this.sky as Sky).material.uniforms["turbidity"].value = 10;
    (this.sky as Sky).material.uniforms["rayleigh"].value = 3;
    (this.sky as Sky).material.uniforms["mieCoefficient"].value = 0.005;
    (this.sky as Sky).material.uniforms["mieDirectionalG"].value = 0.7;
    // (this.sky as Sky).material.uniforms["sunPosition"].value.set(-0.5, 0.24, 0.95);
    (this.sky as Sky).material.uniforms["sunPosition"].value.copy(sunPosition);

    if (_options?.directionalLight) {
      const sunlight = this.getSunlight();
      this.scene.add(sunlight);

      if (this.config.debug && this.gui) {
        this.guiFolders.lights
          .add(sunlight, "intensity")
          .min(0)
          .max(5)
          .step(0.1)
          .name("sunlight intensity");
        this.guiFolders.lights.addColor(sunlight, "color");
      }
    }

    if (_options?.hemisphereLight) {
      const hemisphereLight = this.getHemisphereLight();
      this.scene.add(hemisphereLight);

      if (this.config.debug && this.gui) {
        this.guiFolders.lights
          .add(hemisphereLight, "intensity")
          .min(0)
          .max(5)
          .step(0.1)
          .name("hemisphereLight intensity");
        // this.guiFolders.lights.addColor(hemisphereLight, "skyColor");
        // this.guiFolders.lights.addColor(hemisphereLight, "groundColor");
      }
    }

    if (this.config.debug && this.gui) {
      for (let dimension of ["x", "y", "z"]) {
        this.guiFolders.sky
          .add(
            (this.sky as Sky).material.uniforms["sunPosition"].value,
            dimension
          )
          .min(-1)
          .max(1)
          .step(0.01)
          .name("sunPosition " + dimension);
      }
      // this.guiFolders.sky
      //   .add(sunCoords, "elevation")
      //   .min(0)
      //   .max(90)
      //   .step(1)
      //   .name("sun elevation")
      //   .onFinishChange(
      //     this.createSkybox(sunCoords.elevation, sunCoords.azimuth, {
      //       // directionalLight: true,
      //     })
      //   );
      this.guiFolders.sky
        .add((this.sky as Sky).material.uniforms["rayleigh"], "value")
        .min(0)
        .max(10)
        .step(0.1)
        .name("rayleigh");
      this.guiFolders.sky
        .add((this.sky as Sky).material.uniforms["mieCoefficient"], "value")
        .min(0)
        .max(1)
        .step(0.01)
        .name("mieCoefficient");
      this.guiFolders.sky
        .add((this.sky as Sky).material.uniforms["mieDirectionalG"], "value")
        .min(0)
        .max(1)
        .step(0.01)
        .name("mieDirectionalG");
    }
  }

  public enableDebug() {
    this.gui = new GUI();
    this.guiFolders.renderer = this.gui.addFolder("Renderer");
    this.guiFolders.sky = this.gui.addFolder("Sky");
    this.guiFolders.lights = this.gui.addFolder("Lights");
  }

  public setOutdoorLighting(time: string) {}

  private getSunlight(): THREE.DirectionalLight {
    // Position
    const sunlightPosition = { x: 0, y: 0, z: 0 };
    for (let dimension of ["x", "y", "z"]) {
      sunlightPosition[dimension] =
        (this.sky as Sky).material.uniforms["sunPosition"].value[dimension] *
        (this.sky as Sky).scale[dimension];
    }

    // Color
    const [sunR, sunG, sunB] = this.getVectorRGBA(sunlightPosition);
    const sunlightColor = new THREE.Color().setRGB(
      sunR,
      sunG,
      sunB,
      THREE.SRGBColorSpace
    );

    // Directional light
    const sunlight = new THREE.DirectionalLight(sunlightColor, 0.5);
    sunlight.position.set(
      sunlightPosition.x,
      sunlightPosition.y,
      sunlightPosition.z
    );
    return sunlight;
  }

  private getHemisphereLight(): THREE.HemisphereLight {
    const [upR, upG, upB] = this.getVectorRGBA({ x: 0, y: 1, z: 0 });
    const [downR, downG, downB] = this.getVectorRGBA({ x: 0, y: -1, z: 0 });
    const upColor = new THREE.Color().setRGB(
      upR,
      upG,
      upB,
      THREE.SRGBColorSpace
    );
    const downColor = new THREE.Color().setRGB(
      downR,
      downG,
      downB,
      THREE.SRGBColorSpace
    );
    const hemisphereLight = new THREE.HemisphereLight(upColor, downColor, 0.5);
    return hemisphereLight;
  }

  private getVectorRGBA({
    x,
    y,
    z,
  }: {
    x: number;
    y: number;
    z: number;
  }): Float32Array {
    // Camera
    const cameraSize = 0.5;
    const orthoCamera = new THREE.OrthographicCamera(
      -cameraSize,
      cameraSize,
      cameraSize,
      -cameraSize
    );
    orthoCamera.lookAt(x, y, z);
    orthoCamera.translateOnAxis(new THREE.Vector3(0, 0, -1), 20);
    this.scene.add(orthoCamera, new THREE.CameraHelper(orthoCamera));

    // Render target
    let skyTexture = new THREE.WebGLRenderTarget(
      this.sizes.width,
      this.sizes.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
      }
    );

    // Renderer
    this.renderer.setRenderTarget(skyTexture);
    this.renderer.clear();
    this.renderer.render(this.scene, orthoCamera);
    this.renderer.setRenderTarget(null);
    const read = new Float32Array(4);
    this.renderer.readRenderTargetPixels(skyTexture, 10, 10, 1, 1, read);
    console.log(read);
    return read;
  }

  public get time(): number {
    return this.clock.elapsedTime;
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
