import { Environment } from "./environment";
import { ChartListPage } from "../pages/chart-list/chart-list";
import { MockSongPacksProvider, SongPacksProvider } from "../providers/song-packs/song-packs";
import { SongPack } from "../models/songs";
import { HttpClient } from "@angular/common/http";

export const environment: Environment = {
    onLoad: async app => {
        const injector = app.injector;

        const http = injector.get(HttpClient);

        const mockSongPacksProvider = injector.get(SongPacksProvider) as MockSongPacksProvider;
        if (mockSongPacksProvider) {
            const songPacks = await http.get<SongPack[]>("http://localhost:4020/song-packs")
                .toPromise()
                .catch(() => []);

            mockSongPacksProvider.mockSavedSongPacks(songPacks);
        }

        app.navToComponent(ChartListPage);
    }
}