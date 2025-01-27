import { App, Modal } from "obsidian";
import { HatDailyPluginSettings, ViewType } from "../interface";
import { open3ColumnView } from "../utils";

export class ViewSelectorModal extends Modal {
	settings: HatDailyPluginSettings;
	constructor(app: App, settings: HatDailyPluginSettings) {
		super(app);
		this.settings = settings;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "请选择 Choose" });

		const buttonContainer = contentEl.createDiv("button-container");

		const choices = [
			ViewType.DailyView,
			ViewType.MonthlyView,
			ViewType.YearlyView,
		];

		choices.forEach((choice: ViewType) => {
			const choiceButton = buttonContainer.createEl("button", {
				text: this.choiceToTitle(choice),
				cls: "mod-cta",
			});
			choiceButton.addEventListener("click", () => {
				void open3ColumnView(this.app, this.settings, choice);
				this.close();
			});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	choiceToTitle(choice: ViewType): string {
		switch (choice) {
			case ViewType.DailyView:
				return "日间视图 Daliy View";
			case ViewType.MonthlyView:
				return "月间视图 Monthly View";
			case ViewType.YearlyView:
				return "年间视图 Yearly View";
			default:
				throw new Error("Invalid choice");
		}
	}
}
