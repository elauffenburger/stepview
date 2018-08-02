import { SongPack } from '../../models/songs';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { FileProvider } from '../file/file';

import 'zip-js';

export abstract class SongPacksProvider {
  abstract getSavedSongPacks(): Promise<SongPack[]>;
  abstract saveSongPack(name: string, songPackDataUrl: string): Promise<any>;
}

@Injectable()
export class MockSongPacksProvider implements SongPacksProvider {
  private songPacks: SongPack[] = [];

  constructor(private fileService: FileProvider) {}

  getSavedSongPacks(): Promise<SongPack[]> {
    return Observable
      .interval(300)
      .take(1)
      .map(i => this.songPacks)
      .toPromise();
  }

  async saveSongPack(name: string, songPackDataUrl: string): Promise<any> {
    
  }

  mockSavedSongPacks(songPacks: SongPack[]) {
    this.songPacks.slice(0, this.songPacks.length);

    for (let pack of songPacks) {
      this.songPacks.push(pack);
    }
  }
}
