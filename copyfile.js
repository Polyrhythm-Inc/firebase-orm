const fs = require('fs');
const path = require('path');

for(const entry of fs.readdirSync('./src')) {
    const p = path.parse(entry);
    if(p.ext !== ".ts") {
        continue;
    }
    if(p.name == "type-mapper") {
        continue;
    }

    const out = `${__dirname}/../firebase-orm-client/src/${entry}`;
    fs.copyFileSync(`./src/${entry}`, out);
    console.log(`copied to: ${out}`);
}