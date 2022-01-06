export default async function importUltrastarEsSong(url: string) {
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    const text = await response.text();

    const doc = new DOMParser().parseFromString(text, 'text/html');

    const id = doc.querySelector('ul[data-id]')?.getAttribute('data-id');
    const txtUrl = `https://ultrastar-es.org/pl/canciones/descargar/txt/${id}`;
    window.location.href = txtUrl;

    const authorPath = doc.querySelector('#listado > ul > li > dl > dd:nth-child(6) > a')?.getAttribute('href');
    const videoId = doc.querySelector('#listado > ul > li')?.getAttribute('data-id');

    return {
        authorUrl: authorPath ? 'https://ultrastar-es.org' + authorPath : '',
        author: doc.querySelector('#listado > ul > li > dl > dd:nth-child(6)')?.textContent ?? '',
        videoUrl: videoId ? 'https://www.youtube.com/watch?v=' + videoId : '',
    };
}
