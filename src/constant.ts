import { HatDailyPluginSettings } from "./interface";

export const DEFAULT_SETTINGS: HatDailyPluginSettings = {
	dailyFileFormat: "YYYY-MM-DD",
	yearlyFileFormat: "YYYY-MM",
	monthlyFileFormat: "YYYY",

	dailyTemplatePath: null,
	monthlyTemplatePath: null,
	yearlyTemplatePath: null,

	dailyFolderPath: null,
};
