const isPrerendering = process.env.NODE_ENV === 'development' || !document.getElementById('root')?.hasChildNodes();

export default isPrerendering;
