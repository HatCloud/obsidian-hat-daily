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
			.setName("Daily Root Path")
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

		new Setting(containerEl)
			.setName("Enable Modal Button")
			.setDesc(
				"Enable the modal button in the ribbon, which allows you to select the view type. \nrequires a restart to take effect."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableModalButton)
					.onChange(async (value) => {
						this.plugin.settings.enableModalButton = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName("Daily File Format").addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.dailyFileFormat)
				.setValue(this.plugin.settings.dailyFileFormat)
				.onChange(async (value) => {
					this.plugin.settings.dailyFileFormat = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl)
			.setName("Monthly File Format")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.monthlyFileFormat)
					.setValue(this.plugin.settings.monthlyFileFormat)
					.onChange(async (value) => {
						this.plugin.settings.monthlyFileFormat = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName("Yearly File Format").addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.yearlyFileFormat)
				.setValue(this.plugin.settings.yearlyFileFormat)
				.onChange(async (value) => {
					this.plugin.settings.yearlyFileFormat = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl)
			.setName("Daily Template Path")
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
			.setName("Monthly Template Path")
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
			.setName("Yearly Template Path")
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
