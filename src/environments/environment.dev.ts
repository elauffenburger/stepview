import { Environment } from "./environment";
import { ChartListPage } from "../pages/chart-list/chart-list";

export const environment: Environment = {
    onLoad: async app => {
        app.navToComponent(ChartListPage);
    }
}