import { App, Modal, Notice } from "obsidian";
import { HatDailyPluginSettings, ViewType } from "../interface";
import {
	getOrCreateNoteFile,
	getRecentNote,
	getTemplate,
	openTriplePane,
} from "../utils";

export class ViewSelectorModal extends Modal {
	settings: HatDailyPluginSettings;
	constructor(app: App, settings: HatDailyPluginSettings) {
		super(app);
		this.settings = settings;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "请选择一个选项" });

		const buttonContainer = contentEl.createDiv("button-container");

		const choices = ["日间视图", "月间视图", "年间视图"];

		choices.forEach((choice: "日间视图" | "月间视图" | "年间视图") => {
			const choiceButton = buttonContainer.createEl("button", {
				text: choice,
				cls: "mod-cta",
			});
			choiceButton.addEventListener("click", () => {
				void this.openChoiceView(choice);
				this.close();
			});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	async openChoiceView(choice: ViewType) {
		const dailyFolderPath = this.settings.dailyFolderPath;
		if (!dailyFolderPath) {
			new Notice("请先设置日记根目录");
			return;
		}
		const todayDate = window.moment().format(this.settings.dailyFileFormat);
		const currentMonth = window
			.moment()
			.format(this.settings.monthlyFileFormat);
		const currentYear = window
			.moment()
			.format(this.settings.yearlyFileFormat);
		const recentNote = await getRecentNote(
			this.app,
			choice,
			dailyFolderPath,
			this.settings
		);

		const templatePath: string | null = getTemplate(choice, this.settings);

		switch (choice) {
			case "日间视图":
				await openTriplePane(
					this.app,
					recentNote,
					await getOrCreateNoteFile(
						this.app,
						todayDate,
						templatePath,
						dailyFolderPath
					),
					await getOrCreateNoteFile(
						this.app,
						currentMonth,
						templatePath,
						dailyFolderPath
					)
				);
				break;
			case "月间视图":
				await openTriplePane(
					this.app,
					recentNote,
					await getOrCreateNoteFile(
						this.app,
						currentMonth,
						templatePath,
						dailyFolderPath
					),
					await getOrCreateNoteFile(
						this.app,
						currentYear,
						templatePath,
						dailyFolderPath
					)
				);
				break;
			case "年间视图":
				await openTriplePane(
					this.app,
					recentNote,
					await getOrCreateNoteFile(
						this.app,
						currentYear,
						templatePath,
						dailyFolderPath
					),
					null
				);
				break;
		}
	}
}
