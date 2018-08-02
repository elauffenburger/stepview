import { StepviewApp } from "../app/app.component";

export interface Environment {
    onLoad?: (app: StepviewApp) => Promise<any>
}

export const environment: Environment = {

}