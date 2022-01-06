export default async function importSongFromSource(url: string) {
    const urlObj = new URL(url);

    if (urlObj.host === 'usdb.animux.de') {
        return importUsDbAnimuxSong(url, urlObj);
    }

    return importUltrastarEsSong(url);
}

async function importUltrastarEsSong(url: string) {
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

async function importUsDbAnimuxSong(url: string, obj: URL) {
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    const text = await response.text();

    const doc = new DOMParser().parseFromString(text, 'text/html');

    const author = doc.querySelector('a[href^="?link=profil&id="]')?.textContent;
    const authorPath = doc.querySelector('a[href^="?link=profil&id="]')?.getAttribute?.('href');

    const artist = doc.querySelector('#tablebg > tbody > tr:nth-child(3) > td > table:nth-child(2) > tbody > tr.list_head > td:nth-child(1)')?.textContent;
    const title = doc.querySelector('#tablebg > tbody > tr:nth-child(3) > td > table:nth-child(2) > tbody > tr.list_head > td:nth-child(2)')?.textContent;

    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(artist + ' ' + title)}`, '_blank');
    window.open(`http://usdb.animux.de/index.php?link=gettxt&id=${obj.searchParams.get('id')}`, '_blank');

    return {
        authorUrl: authorPath ? 'http://usdb.animux.de/index.php' + authorPath : '',
        author: author ?? '',
        videoUrl: '',
    };
}