export * from './charts'
export * from './constants'

export interface ParsedDataUri {
    mimeType: string;
    isBase64: boolean;
    content: string;
}

const DATA_URI_REGEX = /data:(.*?);?(base64)?,(.*)/
export function parseDataUri(uri: string): ParsedDataUri {
    const parsed = DATA_URI_REGEX.exec(uri);
    if (!parsed || !parsed.length) {
        return null;
    }

    return {
        mimeType: parsed[1],
        isBase64: !!parsed[2],
        content: parsed[3]
    };
}

export function timeOperation<T>(op: () => T): { result: T, elapsedMs: number } {
    const before = performance.now();
    const result = op();
    const after = performance.now();

    return { result, elapsedMs: (after - before) };
}