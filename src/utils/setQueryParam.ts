export default function setQueryParam(params: Record<string, string | null>) {
  const url = new URL(window.location.href);

  Object.entries(params).forEach(([param, value]) => {
    if (value === null) {
      url.searchParams.delete(param);
    } else {
      url.searchParams.set(param, value);
    }
  });
  window.history.replaceState(null, '', url.toString());
}
