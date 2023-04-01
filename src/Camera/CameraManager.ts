import Listener from 'utils/Listener';
import { cameraShot } from 'SoundManager';

const CAMERA_GRANT_KEY = 'CAMERA_GRANT_KEY';

const storedGrant = sessionStorage.getItem(CAMERA_GRANT_KEY);

class CameraManager extends Listener<[boolean]> {
    private canvas: HTMLCanvasElement;
    private video: HTMLVideoElement;
    private stream: MediaStream | null = null;
    private photos: string[] = [];

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
        } catch (e) {
            this.permissionGranted = false;
        }
        sessionStorage.setItem(CAMERA_GRANT_KEY, JSON.stringify(this.permissionGranted));
        this.onUpdate(this.permissionGranted);

        return this.permissionGranted;
    };

    public disable = () => {
        this.permissionGranted = false;
        sessionStorage.setItem(CAMERA_GRANT_KEY, JSON.stringify(this.permissionGranted));
        this.onUpdate(this.permissionGranted);
    };

    public startRecord = async () => {
        if (!this.permissionGranted) return;
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });

        const settings = this.stream.getVideoTracks()[0].getSettings();

        this.video.width = settings.width ?? this.video.width;
        this.video.height = settings.height ?? this.video.height;
        this.canvas.width = this.video.width;
        this.canvas.height = this.video.height;
        this.video.srcObject = this.stream;
        await this.video.play();
    };

    public stopRecord = async () => {
        if (!this.permissionGranted) return;
        this.stream?.getTracks().forEach((track) => track.stop());
    };

    public takePhoto = async () => {
        if (!this.permissionGranted) return;
        const context = this.canvas.getContext('2d');
        if (context) {
            context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

            this.photos.push(this.canvas.toDataURL('image/png'));
            cameraShot.play();
        }
    };
    public getPhotos = () => this.photos;
    public clearPhotos = () => {
        this.photos.length = 0;
    };
}

export default new CameraManager();
