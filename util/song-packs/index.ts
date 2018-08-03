import express from 'express';

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

import { SongPack } from '../../src/models/songs';

const port = process.env.PORT || 4020;
const app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/song-packs', (req, res) => {
    const packs = fs.readdirSync(path.resolve(__dirname, './packs'))
        .map(dir => getSongPack(dir));

    res.send(packs);
});

app.get('/song-packs/:songPackName', (req, res) => {
    const { songPackName } = req.params;

    res.send(getSongPack(songPackName));
});

app.listen(port, () => {
    console.log(chalk.green(`Listening on port ${port}`));
});

const cachedPacks = {};
function getSongPack(songPackName: string): SongPack {
    const cachedPack = cachedPacks[songPackName];
    if (cachedPack) {
        return cachedPack;
    }

    const songPackSongsDir = `./packs/${songPackName}/songs`;

    const songs = fs.readdirSync(path.resolve(__dirname, songPackSongsDir))
        .map(fileName => {
            const file = fs.readFileSync(`${songPackSongsDir}/${fileName}`, { encoding: 'utf8' });

            return JSON.parse(file.toString());
        });

    const pack = <SongPack>{
        name: songPackName,
        songs: songs
    };

    cachedPacks[songPackName] = pack;

    return pack;
}