export default function setQueryParam(params: Record<string, string | null>) {
  const url = new URL(global.location?.href);

  Object.entries(params).forEach(([param, value]) => {
    if (value === null) {
      url.searchParams.delete(param);
    } else {
      url.searchParams.set(param, value);
    }
  });
  global.history.replaceState(null, '', url.toString());
}
