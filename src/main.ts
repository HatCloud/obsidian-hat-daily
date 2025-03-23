import { Notice, Plugin } from "obsidian";
import { ChoicesModal } from "./compoents/ViewSelectorModal";
import { HatDailyPluginSettings, ViewType } from "./interface";
import { DEFAULT_SETTINGS } from "./constant";
import { HatDailySettingTab } from "./compoents/HatDailySettingTab";
import { open3ColumnView } from "./utils";

export default class HatDailyPlugin extends Plugin {
	settings: HatDailyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("notebook", "Hat daily", () => {
			if (this.settings.dailyFolderPath === null) {
				new Notice("Please set the daily folder path first.");
				return;
			}
			open3ColumnView(this.app, this.settings, ViewType.DailyView);
		}).addClass("hat-daily-plugin-ribbon-class");

		this.addRibbonIcon("scroll", "Open hat daily modal", () => {
			new ChoicesModal(this.app, this.settings).open();
		}).addClass("hat-daily-plugin-ribbon-class");

		this.addCommand({
			id: "open-view-daily",
			name: "Open daily 3 column view",
			callback: () => {
				open3ColumnView(this.app, this.settings, ViewType.DailyView);
			},
		});

		this.addCommand({
			id: "open-view-monthly",
			name: "Open monthly 3 column view",
			callback: () => {
				open3ColumnView(this.app, this.settings, ViewType.MonthlyView);
			},
		});

		this.addCommand({
			id: "open-view-yearly",
			name: "Open yearly 3 column view",
			callback: () => {
				open3ColumnView(this.app, this.settings, ViewType.YearlyView);
			},
		});

		this.addSettingTab(new HatDailySettingTab(this.app, this));
	}

	onunload() {
		document
			.querySelectorAll(".choice-modal-style")
			.forEach((el) => el.remove());
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
