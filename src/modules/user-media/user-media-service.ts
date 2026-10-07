import Listener from '~/modules/utils/listener';

// 'blocked-by-system' - the site is allowed, but the OS denies the browser app itself the mic
// (e.g. Chrome without the Android microphone permission), so the site prompt reappears on every request
type accessStatus = 'uninitialised' | 'requested' | 'accepted' | 'declined' | 'blocked-by-system';

const isBlockedBySystem = (e: unknown) =>
  e instanceof Error && e.name === 'NotAllowedError' && e.message.toLowerCase().includes('by system');

class UserMediaService extends Listener<[accessStatus]> {
  private status: accessStatus = 'uninitialised';

  public getUserMedia: typeof navigator.mediaDevices.getUserMedia = async (...args) =>
    this.requestAndTrack(() => navigator.mediaDevices.getUserMedia(...args));

  public enumerateDevices: typeof navigator.mediaDevices.enumerateDevices = async (...args) =>
    this.requestAndTrack(() => navigator.mediaDevices.enumerateDevices(...args));

  private requestAndTrack = async <T extends CallableFunction>(fnc: T) => {
    try {
      if (this.status !== 'accepted') this.setStatus('requested');
      const result = await fnc();
      this.setStatus('accepted');

      return result;
    } catch (e) {
      this.setStatus(isBlockedBySystem(e) ? 'blocked-by-system' : 'declined');
      throw e;
    }
  };

  private setStatus = (newStatus: accessStatus) => {
    this.status = newStatus;

    this.onUpdate(newStatus);
  };

  public getStatus = () => this.status;
}

export default new UserMediaService();
