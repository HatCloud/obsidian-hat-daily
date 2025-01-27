import { Notice, Plugin } from "obsidian";
import { ViewSelectorModal } from "./compoents/ViewSelectorModal";
import { HatDailyPluginSettings } from "./interface";
import { DEFAULT_SETTINGS } from "./constant";
import { HatDailySettingTab } from "./compoents/HatDailySettingTab";

export default class HatDailyPlugin extends Plugin {
	settings: HatDailyPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addStyles();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"scroll",
			"Hat Daily",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				if (this.settings.dailyFolderPath === null) {
					new Notice("请先设置日记根目录");
					return;
				}
				new ViewSelectorModal(this.app, this.settings).open();
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("hat-daily-plugin-ribbon-class");

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
