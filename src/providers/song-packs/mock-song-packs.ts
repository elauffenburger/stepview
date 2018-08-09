import { SongPack } from '../../models/songs';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { File } from '@ionic-native/file';
import { NGXLogger } from 'ngx-logger';

import * as JSZip from 'jszip';
import { HttpClient } from '@angular/common/http';
import { SmFileStepChartParser } from '../../../lib/stepview-lib/services/stepchart-parser';
import { SongPacksProvider, JSZIP_OBJECT } from './song-packs';
import { timeOperation } from '../../helpers';

@Injectable()
export class MockSongPacksProvider extends SongPacksProvider {
    private songPacks: SongPack[] = [];

    constructor(
        @Inject(JSZIP_OBJECT) zip: JSZip,
        file: File,
        logger: NGXLogger,
        private http: HttpClient,
        private smFileChartParser: SmFileStepChartParser) {
        super(zip, file, logger);

        // For debug!
        (<any>window)._injected = (<any>window)._injected || {};
        (<any>window)._injected.file = file;
    }

    getSavedSongPacks(): Promise<SongPack[]> {
        return this.http
            .get<{ name: string; songs: string[] }[]>(this.toApiUrl("/song-packs"))
            .map(packs => {
                return packs.map(pack => {
                    return {
                        name: pack.name,
                        songs: pack.songs.map(song => {
                            const { result, elapsedMs } = timeOperation(() => this.smFileChartParser.parse(song, { includeNotesSegments: false }));
                            this.logger.debug(`Parsing chart took ${elapsedMs}ms`)

                            return result;
                        })
                    };
                });
            })
            .toPromise();
    }

    mockSavedSongPacks(songPacks: SongPack[]) {
        this.songPacks.slice(0, this.songPacks.length);

        for (let pack of songPacks) {
            this.songPacks.push(pack);
        }
    }

    private toApiUrl(url: string): string {
        return `http://localhost:4020${url}`;
    }
}
