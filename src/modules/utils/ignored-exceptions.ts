const ignoredExceptions: (string | RegExp)[] = [
  'AbortError: Version change transaction was aborted in upgradeneeded event handler.',
  'The object can not be found here.',
  'Document is hidden.',
  "Failed to register a ServiceWorker for scope ('https://allkaraoke.party/') with script",
  'NotAllowedError: Permission denied by system',
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications.',
  'NotAllowedError: Document is not focused.',
  'Error: Socket was destroyed!',
  /TypeError: Failed to fetch/,
  // Random plugins/extensions
  'top.GLOBALS',
  // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
  'originalCreateNotification',
  'canvas.contentDocument',
  'MyApp_RemoveAllHighlights',
  'http://tt.epicplay.com',
  "Can't find variable: ZiteReader",
  'jigsaw is not defined',
  'ComboSearch is not defined',
  'http://loading.retry.widdit.com/',
  'atomicFindClose',
  // Facebook borked
  'fb_xd_fragment',
  // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
  // reduce this. (thanks @acdha)
  // See http://stackoverflow.com/questions/4113268
  'bmi_SafeAddOnload',
  'EBCallBackMessageReceived',
  // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
  'conduitPage',
  'Transition was aborted because of invalid state',
  'NotFoundError: Requested device not found',
  /Transport disconnected during RPC: .+/,
  /RPC timeout: .+/,
  /Not connected \(calling .+\)/,
];

export const isIgnoredException = (message: string | null | undefined): boolean => {
  if (!message) return false;

  return ignoredExceptions.some((entry) => (entry instanceof RegExp ? entry.test(message) : message.includes(entry)));
};
