import express from 'express';

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import BSON from 'bson';

import { SongPack } from '../../src/models/songs';

const bson = new BSON();

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
function getSongPack(songPackName: string): { name: string, songs: string[] } {
    const cachedPack = cachedPacks[songPackName];
    if (cachedPack) {
        return cachedPack;
    }

    const songPackSongsDir = `./packs/${songPackName}/songs`;

    const songs = fs.readdirSync(path.resolve(__dirname, songPackSongsDir))
        .map(fileName => {
            return fs.readFileSync(`${songPackSongsDir}/${fileName}`, { encoding: 'utf8' });
        });

    const pack = {
        name: songPackName,
        songs: songs
    };

    cachedPacks[songPackName] = pack;

    return pack;
}