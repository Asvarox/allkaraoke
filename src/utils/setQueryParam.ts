export default function setQueryParam(params: Record<string, string | null>) {
  const url = new URLSearchParams(window.location.search);

  Object.entries(params).forEach(([param, value]) => {
    if (value === null) {
      url.delete(param);
    } else {
      url.set(param, value);
    }
  });

  return `?${url.toString()}`;
}
