export enum ViewType {
	DailyView = "DailyView",
	MonthlyView = "MonthlyView",
	YearlyView = "YearlyView",
}

export interface HatDailyPluginSettings {
	dailyFileFormat: string;
	monthlyFileFormat: string;
	yearlyFileFormat: string;

	dailyTemplatePath: string | null;
	monthlyTemplatePath: string | null;
	yearlyTemplatePath: string | null;

	dailyFolderPath: string | null;

	enableModalButton: boolean;
}
