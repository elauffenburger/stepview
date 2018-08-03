import { SongPack } from '../../models/songs';
import { Observable } from 'rxjs';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { FileProvider } from '../file/file';
import { File } from '@ionic-native/file';
import { NGXLogger } from 'ngx-logger';

import * as JSZip from 'jszip';
import * as _ from 'lodash';

export const JSZIP_OBJECT = new InjectionToken('JSZIP_OBJECT');

const SONG_PACK_DIR = 'song-packs'

export abstract class SongPacksProvider {
  constructor(private fileService: FileProvider, @Inject(JSZIP_OBJECT) private zip: JSZip, private file: File, private logger: NGXLogger) { }

  abstract getSavedSongPacks(): Promise<SongPack[]>;

  async saveSongPack(songPackBase64Content: string): Promise<any> {
    const zip = await this.zip.loadAsync(songPackBase64Content, { base64: true });
    const files = toFileList(zip);

    // First, we need to make sure all the directories exist

    // Get the files that are directories, then split them into parts and include the base `SONG_PACK_DIR`
    // Also, we expect the zip to have a root folder (the pack itself), so we can ignore the zip name (which will be the containing directory)
    // Directories will have a trailing '/', so ignore the last part (which will be '')
    const canonicalizedDirectoryPathParts = files
      .filter(file => isDir(file))
      .map(d => [SONG_PACK_DIR].concat(d.name.split('/').slice(1, -1)));

    // We can use `seenPaths` to keep track of paths we've already processed
    const seenPaths = {};

    // For each full directory, make sure the intermediate directories are created
    for (let parts of canonicalizedDirectoryPathParts) {
      parts = parts || [];

      // Incrementially build back each full directory and ensure each intermediate
      // directory is created
      const intermediatePathParts = [];
      for (let part of parts) {
        // Add this intermediate directory to the "directory path builder"
        intermediatePathParts.push(part);

        // Rebuild the path
        const path = intermediatePathParts.join('/');

        // If we've already seen this path, skip it
        if (seenPaths[path]) {
          continue;
        }

        try {
          try {
            await this.file.checkDir(this.file.dataDirectory, path)
          } catch (e) {
            await this.file.createDir(this.file.dataDirectory, path, false);
          }

          seenPaths[path] = true;
        } catch (e) {
          console.log(e);
          this.logger.error('Error while writing dir: ', e);
        }
      }
    }

    // Now, we can write the files
    const writeFilesPromises = files
      .filter(file => !isDir(file))
      .map(async file => {
        const content = await file.async('base64');

        try {
          await this.file.writeFile(this.file.dataDirectory, `song-packs/${file.name}`, content, { replace: true })
        } catch (e) {
          console.log(e);
          this.logger.error('Error while saving: ', e);
        }
      });

    await Promise.all(writeFilesPromises);

    function toFileList(zip: JSZip): JSZip.JSZipObject[] {
      const files = zip.files;

      return Object.keys(files).map(key => files[key]);
    }

    function isDir(file: JSZip.JSZipObject): boolean {
      const pathParts = file.name.split('/');

      return pathParts[pathParts.length - 1] === '';
    }
  }
}

@Injectable()
export class MockSongPacksProvider extends SongPacksProvider {
  private songPacks: SongPack[] = [];

  constructor(fileService: FileProvider, @Inject(JSZIP_OBJECT) zip: JSZip, file: File, logger: NGXLogger) {
    super(fileService, zip, file, logger);

    // For debug!
    (<any>window)._injected = (<any>window)._injected || {};
    (<any>window)._injected.file = file;
  }

  getSavedSongPacks(): Promise<SongPack[]> {
    return Observable
      .interval(300)
      .take(1)
      .map(i => this.songPacks)
      .toPromise();
  }

  mockSavedSongPacks(songPacks: SongPack[]) {
    this.songPacks.slice(0, this.songPacks.length);

    for (let pack of songPacks) {
      this.songPacks.push(pack);
    }
  }
}
