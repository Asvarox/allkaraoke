import { Browser, BrowserContext, Page } from '@playwright/test';

import { Calibration } from '../components/calibration';

export class OnlineSetupPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  calibration = new Calibration(this.page, this.context, this.browser);

  public get createRoomButton() {
    return this.page.getByTestId('create-room-button');
  }

  public get joinExistingRoomButton() {
    return this.page.getByTestId('join-existing-room-button');
  }

  public get roomCodeInput() {
    return this.page.getByTestId('join-room-code-input');
  }

  public get joinRoomButton() {
    return this.page.getByTestId('join-room-button');
  }

  public get backButton() {
    return this.page.getByTestId('back-button');
  }

  public get joinRejectedElement() {
    return this.page.getByTestId('online-join-rejected');
  }

  /** Lands on the online mode entry screen, offering create/join. */
  public async goto() {
    await this.page.goto('/online/?e2e-test');
  }

  /** Lands on the online mode entry screen with a room's code prefilled from an invite link. */
  public async gotoRoomLink(roomCode: string) {
    await this.page.goto(`/online/?room=${roomCode}&e2e-test`);
  }

  public async goBack() {
    await this.backButton.click();
  }

  public async submitRoomCode() {
    await this.joinRoomButton.click();
  }

  /**
   * The wizard steps after the room is chosen: name, mic, then the one-time calibration. Calibration
   * happens here rather than in the lobby, so readying up later is a single click. A name and a
   * calibration remembered from an earlier visit drop their step from the wizard entirely — pass
   * `nameStep`/`calibrationStep` as false for those, rather than probing, so there's nothing to race.
   */
  public async completeNameMicAndCalibrationSteps(name: string, { nameStep = true, calibrationStep = true } = {}) {
    if (nameStep) {
      await this.page.getByTestId('online-name-input').fill(name);
      await this.page.getByTestId('next-step-button').click();
    }
    // Mic setup step — the default (fake) microphone is auto-selected
    await this.page.getByTestId('save-button').click();
    if (calibrationStep) {
      await this.calibration.approveDefaultCalibrationSetting();
    }
  }

  public async joinRoomByCode(roomCode: string) {
    await this.joinExistingRoomButton.click();
    await this.roomCodeInput.fill(roomCode);
    await this.submitRoomCode();
  }

  public async createRoom(name: string) {
    await this.createRoomButton.click();
    await this.completeNameMicAndCalibrationSteps(name);
  }
}
