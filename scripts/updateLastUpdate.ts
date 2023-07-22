import { readFileSync, writeFileSync } from 'fs';
import * as process from 'process';

const files = process.argv.slice(2);

console.log(files);
files.forEach((file) => {
    if (file.includes('index.json')) return;

    const updateDate = new Date().toISOString();
    const contents = readFileSync(file, 'utf-8');
    const data = JSON.parse(contents);
    data.lastUpdate = updateDate;
    writeFileSync(file, JSON.stringify(data, undefined, 2), 'utf-8');
});
