import { App, PluginSettingTab, Setting } from "obsidian";
import { DEFAULT_SETTINGS } from "src/constant";
import HatDailyPlugin from "src/main";

export class HatDailySettingTab extends PluginSettingTab {
	plugin: HatDailyPlugin;

	constructor(app: App, plugin: HatDailyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Daily root path")
			.setDesc("The root path of your daily notes.\nExample: 'Daily'")
			.addText((text) =>
				text
					.setPlaceholder("")
					.setValue(this.plugin.settings.dailyFolderPath ?? "")
					.onChange(async (value) => {
						this.plugin.settings.dailyFolderPath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName("Daily file format").addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.dailyFileFormat)
				.setValue(this.plugin.settings.dailyFileFormat)
				.onChange(async (value) => {
					this.plugin.settings.dailyFileFormat = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl)
			.setName("Monthly file format")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.monthlyFileFormat)
					.setValue(this.plugin.settings.monthlyFileFormat)
					.onChange(async (value) => {
						this.plugin.settings.monthlyFileFormat = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName("Yearly file format").addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.yearlyFileFormat)
				.setValue(this.plugin.settings.yearlyFileFormat)
				.onChange(async (value) => {
					this.plugin.settings.yearlyFileFormat = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl)
			.setName("Daily template path")
			.addText((text) =>
				text
					.setPlaceholder("")
					.setValue(this.plugin.settings.dailyTemplatePath ?? "")
					.onChange(async (value) => {
						this.plugin.settings.dailyTemplatePath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Monthly template path")
			.addText((text) =>
				text
					.setPlaceholder("")
					.setValue(this.plugin.settings.monthlyTemplatePath ?? "")
					.onChange(async (value) => {
						this.plugin.settings.monthlyTemplatePath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Yearly template path")
			.addText((text) =>
				text
					.setPlaceholder("")
					.setValue(this.plugin.settings.yearlyTemplatePath ?? "")
					.onChange(async (value) => {
						this.plugin.settings.yearlyTemplatePath = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
