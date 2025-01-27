export type ViewType = "日间视图" | "月间视图" | "年间视图";

export interface HatDailyPluginSettings {
	dailyFileFormat: string;
	monthlyFileFormat: string;
	yearlyFileFormat: string;

	dailyTemplatePath: string | null;
	monthlyTemplatePath: string | null;
	yearlyTemplatePath: string | null;

	dailyFolderPath: string | null;
}
