import { Notice, Plugin } from "obsidian";
import { ViewSelectorModal } from "./compoents/ViewSelectorModal";
import { HatDailyPluginSettings, ViewType } from "./interface";
import { DEFAULT_SETTINGS } from "./constant";
import { HatDailySettingTab } from "./compoents/HatDailySettingTab";
import { open3ColumnView } from "./utils";

export default class HatDailyPlugin extends Plugin {
	settings: HatDailyPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addStyles();

		this.addRibbonIcon("notebook", "Hat Daily", () => {
			if (this.settings.dailyFolderPath === null) {
				new Notice(
					"请先设置日记根目录 Please set the daily folder path first."
				);
				return;
			}
			open3ColumnView(this.app, this.settings, ViewType.DailyView);
		}).addClass("hat-daily-plugin-ribbon-class");

		if (this.settings.enableModalButton) {
			this.addRibbonIcon("scroll", "Open Hat Daily Modal", () => {
				new ViewSelectorModal(this.app, this.settings).open();
			}).addClass("hat-daily-plugin-ribbon-class");
		}

		this.addCommand({
			id: "open-view-daily",
			name: "Open Daily 3 Column View",
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "d" }],
			callback: () => {
				console.log("Hey, you!");
				open3ColumnView(this.app, this.settings, ViewType.DailyView);
			},
		});

		this.addCommand({
			id: "open-view-monthly",
			name: "Open Monthly 3 Column View",
			callback: () => {
				open3ColumnView(this.app, this.settings, ViewType.MonthlyView);
			},
		});

		this.addCommand({
			id: "open-view-yearly",
			name: "Open Yearly 3 Column View",
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

	// 注册插件时调用，为模态对话框添加自定义样式
	addStyles() {
		const styleEl = document.createElement("style");
		document.head.appendChild(styleEl);
		const styleSheet = styleEl.sheet;

		if (!styleSheet) {
			return;
		}

		styleSheet.insertRule(
			".button-container { display: flex; flex-direction: column; gap: 8pt; }",
			0
		);
		styleSheet.insertRule(".choice-button { margin-bottom: 8pt; }", 1);
		styleSheet.insertRule(
			".choice-button:last-child { margin-bottom: 0; }",
			2
		);
	}
}
