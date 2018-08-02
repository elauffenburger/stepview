import { Environment } from "./environment";
import { ChartListPage } from "../pages/chart-list/chart-list";
import { MockSongPacksProvider, SongPacksProvider } from "../providers/song-packs/song-packs";

export const environment: Environment = {
    onLoad: async app => {
        const injector = app.injector;

        const mockSongPacksProvider = injector.get(SongPacksProvider) as MockSongPacksProvider;
        if (mockSongPacksProvider) {
            mockSongPacksProvider.mockSavedSongPacks([]);
        }

        app.navToComponent(ChartListPage);
    }
}