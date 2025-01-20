import Listener from 'modules/utils/Listener';
import storage from 'modules/utils/storage';

const CAMERA_GRANT_KEY = 'CAMERA_GRANT_KEY';

const storedGrant = storage.local.getItem(CAMERA_GRANT_KEY);

class CameraManager extends Listener<[boolean]> {
  private canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private videoData: Blob[] = [];

  public constructor() {
    super();
    this.video = document.createElement('video');
    this.video.width = 480;
    this.video.height = this.video.width * (9 / 16);

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.video.width;
    this.canvas.height = this.video.height;
  }

  private permissionGranted: boolean | null = storedGrant !== null ? JSON.parse(storedGrant) : null;
  public requestPermissions = async () => {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.permissionGranted = true;
      await this.stopRecord();
    } catch (_e) {
      this.permissionGranted = false;
    }
    storage.local.setItem(CAMERA_GRANT_KEY, JSON.stringify(this.permissionGranted));
    this.onUpdate(this.permissionGranted);

    return this.permissionGranted;
  };

  public disable = () => {
    this.permissionGranted = false;
    storage.local.setItem(CAMERA_GRANT_KEY, JSON.stringify(this.permissionGranted));
    this.onUpdate(this.permissionGranted);
  };

  public startRecord = async () => {
    if (!this.permissionGranted) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { frameRate: 2 } });

      const settings = this.stream.getVideoTracks()[0].getSettings();

      this.video.width = settings.width ?? this.video.width;
      this.video.height = settings.height ?? this.video.height;
      this.canvas.width = this.video.width;
      this.canvas.height = this.video.height;
      this.video.srcObject = this.stream;
      await this.video.play();

      this.recorder = new MediaRecorder(this.stream, { mimeType: 'video/webm' });

      this.recorder.ondataavailable = (evt) => {
        this.videoData.push(evt.data);
      };

      this.recorder.start();
    } catch (e) {
      console.warn(e);
    }
  };

  public getVideo = () => {
    const blob = new Blob(this.videoData, { type: 'video/webm' });

    return URL.createObjectURL(blob);
  };

  public stopRecord = async () => {
    if (!this.permissionGranted) return;
    this.recorder?.stop();
    this.stream?.getTracks().forEach((track) => track.stop());
  };
  public clearData = () => {
    this.videoData.length = 0;
  };

  public restartRecord = async () => {
    await this.stopRecord();
    await this.clearData();
    await this.startRecord();
  };

  public getPermissionStatus = () => this.permissionGranted;

  public getLiveCameraFeed = async () => {
    if (!this.permissionGranted) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      return this.stream;
    } catch (e) {
      console.warn(e);
    }
  };
}

export default new CameraManager();
