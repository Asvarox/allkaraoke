// since all pre-rendered pages are static, we can check if the root element has any child nodes
// todo how to make sure pages that are not pre-rendered by design are not marked as being pre-rendered?
const isPreRendering =
  import.meta.env.VITE_APP_PRERENDER === 'true' && !document.getElementById('root')?.hasChildNodes();

export default isPreRendering;
