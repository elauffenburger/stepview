import { SongPack } from '../../models/songs';
import { Observable } from 'rxjs';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { FileProvider } from '../file/file';
import * as JSZip from 'jszip';

export const JSZIP_OBJECT = new InjectionToken('JSZIP_OBJECT');

export abstract class SongPacksProvider {
  abstract getSavedSongPacks(): Promise<SongPack[]>;
  abstract saveSongPack(name: string, songPackBase64Content: string): Promise<any>;
}

@Injectable()
export class MockSongPacksProvider implements SongPacksProvider {
  private songPacks: SongPack[] = [];

  constructor(private fileService: FileProvider, @Inject(JSZIP_OBJECT) private zip: JSZip) { }

  getSavedSongPacks(): Promise<SongPack[]> {
    return Observable
      .interval(300)
      .take(1)
      .map(i => this.songPacks)
      .toPromise();
  }

  async saveSongPack(name: string, songPackBase64Content: string): Promise<any> {
    const result = await this.zip.loadAsync(songPackBase64Content, { base64: true });
    console.log(result);
    //this.fileService.saveApplicationFilesFromDataUrl(`song-packs/${name}`)
  }

  mockSavedSongPacks(songPacks: SongPack[]) {
    this.songPacks.slice(0, this.songPacks.length);

    for (let pack of songPacks) {
      this.songPacks.push(pack);
    }
  }
}
