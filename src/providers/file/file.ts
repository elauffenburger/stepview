import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

type PlatformName = 'ios' | 'android' | 'web' | 'unknown';

@Injectable()
export class MockFileProvider implements FileProvider {
  platformName: PlatformName;

  constructor(private platform: Platform) {
    this.platformName = this.determinePlatformName();
  }

  chooseFileAsDataUrl(beforeLoadFileFn: () => Promise<any>): Promise<string> {
    switch (this.platformName) {
      case 'web':
        return this.chooseFileWeb(beforeLoadFileFn);
    }

    throw 'Unknown platform type!';
  }

  private chooseFileWeb(beforeLoadFileFn: () => Promise<any>): Promise<string> {
    return new Promise((res, rej) => {
      // Make our hidden file element
      const inputElement = document.createElement('input');
      inputElement.type = 'file';
      inputElement.style.display = 'none';

      // Append element to DOM and trigger click
      document.body.appendChild(inputElement);

      inputElement.onchange = async function () {
        // Grab the file
        const file: File = inputElement.files && inputElement.files.length && inputElement.files[0];
        if (!file) {
          rej('No file selected!');
        }

        await beforeLoadFileFn();

        // Prep the FileReader for reading
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
          const result = (e as any).target.result;

          // Remove the input once we're done
          inputElement.remove();

          // Resolve result!
          res(result);
        };

        // Read the file as base64 data (which will be compatible with our other services)
        fileReader.readAsDataURL(file);
      };

      inputElement.click();
    });
  }

  private determinePlatformName(): PlatformName {
    if (document.URL.startsWith('http')) {
      return 'web';
    }

    const matchingPlatformName = (['ios', 'android'] as PlatformName[]).find(name => this.platform.is(name));
    if (matchingPlatformName) {
      return matchingPlatformName;
    }

    return 'unknown';
  }
}

export abstract class FileProvider {
  abstract chooseFileAsDataUrl(beforeLoadFileFn: () => Promise<any>): Promise<string>;
}
