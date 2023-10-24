import GameState from 'Scenes/Game/Singing/GameState/GameState';
import { Curtains, Plane, PlaneParams } from 'curtainsjs';

export class Shaders {
  private curtains: Curtains;
  private plane: Plane;
  public constructor(private canvas: HTMLCanvasElement) {
    this.curtains = new Curtains({
      container: 'canvas',
    });
    const { gl } = this.curtains;
    // https://stackoverflow.com/a/39354174
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
    });
  }

  public updatePlayerCenter = (playerNumber: number, x: number, y: number) => {
    this.plane.uniforms[`p${playerNumber}center`].value = [x / this.canvas.width, 1 - y / this.canvas.height];
  };

  public updatePlayerForce = (playerNumber: number, force: number) => {
    this.plane.uniforms[`p${playerNumber}force`].value = force;
  };

  public cleanup = () => {
    this.plane?.remove();
    this.curtains?.dispose();
  };
}
