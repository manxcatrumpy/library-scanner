const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('/tmp/taaze.html', 'utf8');
const $ = cheerio.load(html);

const item = $('.info_frame').first().parent(); // find the container
const title = item.find('h4.titleMain').text().trim() || item.find('h4.titleMain a').text().trim();
const author = item.text().match(/作者：(.+)/)?.[1]?.trim();
const coverUrl = item.prev().find('img').attr('src') || item.parent().find('img').first().attr('src'); // usually image is before info

console.log("Title:", title);
console.log("Author:", author);
console.log("Cover:", coverUrl);
