import GameState from 'Scenes/Game/Singing/GameState/GameState';
import { Curtains, Plane, PlaneParams } from 'curtainsjs';

export class Shaders {
  private curtains: Curtains;
  private plane: Plane | null = null;
  public constructor(private canvas: HTMLCanvasElement) {
    this.curtains = new Curtains({
      pixelRatio: 1,
      premultipliedAlpha: false,
      container: 'canvas',
    });
    const { gl } = this.curtains;
    // https://stackoverflow.com/a/39354174
    if (!gl) {
      console.info('WebGL not supported');
      return;
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const planeElement = document.getElementById('plane')!;
    const planeDimensions = planeElement.getBoundingClientRect();

    const playerUniforms: Record<string, any> = GameState.getPlayers().reduce(
      (uniforms, player) => ({
        ...uniforms,
        [`p${player.getNumber()}center`]: {
          name: `uP${player.getNumber()}center`,
          type: '2f',
          value: [0, 0],
        },
        [`p${player.getNumber()}force`]: {
          name: `uP${player.getNumber()}force`,
          type: '1f',
          value: 0,
        },
      }),
      {
        resolution: {
          // resolution of our plane
          name: 'uResolution',
          type: '2f',
          value: [planeDimensions.width, planeDimensions.height],
        },
        time: {
          name: 'uTime', // uniform name that will be passed to our shaders
          type: '1f', // this means our uniform is a float
          value: 0,
        },
      },
    );

    // set our initial parameters (basic uniforms)
    const params: PlaneParams = {
      vertexShaderID: 'plane-vs', // our vertex shader ID
      fragmentShaderID: 'plane-fs', // our fragment shader ID
      uniforms: playerUniforms,
    };

    // create our plane using our curtains object, the HTML element and the parameters
    this.plane = new Plane(this.curtains, planeElement, params);

    this.plane.loadCanvas(this.canvas);

    this.plane.onRender(() => {
      // @ts-expect-error
      this.plane!.uniforms.time.value++;
      // console.log(this.plane!.uniforms.p0force.value);
    });

    this.canvas.style.visibility = 'hidden';
  }

  public updatePlayerCenter = (playerNumber: 0 | 1 | 2 | 3, x: number, y: number) => {
    if (!this.plane) return;
    this.plane.uniforms[`p${playerNumber}center`].value = [x / this.canvas.width, 1 - y / this.canvas.height];
  };

  public updatePlayerForce = (playerNumber: 0 | 1 | 2 | 3, force: number) => {
    if (!this.plane) return;
    this.plane.uniforms[`p${playerNumber}force`].value = force;
  };

  public getPlayerForce = (playerNumber: 0 | 1 | 2 | 3) => {
    if (!this.plane) return;
    return this.plane.uniforms[`p${playerNumber}force`].value as number;
  };

  public cleanup = () => {
    try {
      this.plane?.remove();
      this.curtains?.dispose();
    } catch (e) {
      console.warn(e);
    }
  };
}
