import Listener from 'utils/Listener';

type accessStatus = 'uninitialised' | 'requested' | 'accepted' | 'declined';
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
      this.setStatus('declined');
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
