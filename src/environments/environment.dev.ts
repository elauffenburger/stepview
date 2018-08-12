import { Environment } from "./environment";
import { ChartListPage } from "../pages/chart-list/chart-list";
import { RealtimeChartViewerPage, PageArgs as RealtimeChartViewerPageArgs } from "../pages/realtime-chart-viewer/realtime-chart-viewer";
import { SongPacksProvider } from "../providers/song-packs/song-packs";

export const environment: Environment = {
    onLoad: async app => {
        const songPacksProvider: SongPacksProvider = app.injector.get(SongPacksProvider)

        const chart = await songPacksProvider.getSavedSongPacks()
            .then(packs => packs[0].songs[0]);

        const notesSegment = chart.noteSegments.find(segment => segment.difficultyClass == 'challenge' && segment.type == 'dance-single');
        const args: RealtimeChartViewerPageArgs = {
            chart: chart.getParser().parse(chart.getSourceContent(), { normalizeChart: true, includeNotesSegments: true }),
            difficulty: {
                class: notesSegment.difficultyClass,
                meter: notesSegment.difficultyMeter
            },
            type: notesSegment.type
        };

        app.navToComponent(RealtimeChartViewerPage, args);
    }
}