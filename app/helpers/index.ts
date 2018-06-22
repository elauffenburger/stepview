export function split<T>(collection: T[], chunkFn: (item: T) => boolean): T[][] {
    function rec(collection: T[], i: number, results: T[][], chunk: T[]): T[][] {
        // If we're at the end of the line, add the current chunk and return results
        if (i >= collection.length) {
            results.push(chunk);

            return results;
        }

        // Get the current item
        const item = collection[i];

        // If we need to chunk on this item...
        if (chunkFn(item)) {
            // ...add this chunk to the results
            results.push(chunk);

            // ...skip this line & create a new chunk
            return rec(collection, i + 1, results, []);
        }

        // ...otherwise, add to the chunk
        chunk.push(item);

        // ...and move onto the next item!
        return rec(collection, i + 1, results, chunk);
    }

    return rec(collection, 0, [], []);
}