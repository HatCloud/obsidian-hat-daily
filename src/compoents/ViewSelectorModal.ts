import { App, Modal } from "obsidian";
import { HatDailyPluginSettings, ViewType } from "../interface";
import { archiveLastMonth, open3ColumnView } from "../utils";

type ChoiceType =
	| ViewType.DailyView
	| ViewType.MonthlyView
	| ViewType.YearlyView
	| "Archive";

export class ChoicesModal extends Modal {
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
			"Archive",
		];

		choices.forEach((choice: ChoiceType) => {
			const choiceButton = buttonContainer.createEl("button", {
				text: this.choiceToTitle(choice),
				cls: "mod-cta",
			});
			if (choice === "Archive") {
				choiceButton.addEventListener("click", () => {
					void archiveLastMonth(this.app, this.settings);
					this.close();
				});
			} else {
				choiceButton.addEventListener("click", () => {
					void open3ColumnView(this.app, this.settings, choice);
					this.close();
				});
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	choiceToTitle(choice: ChoiceType): string {
		switch (choice) {
			case ViewType.DailyView:
				return "日间视图 Daliy View";
			case ViewType.MonthlyView:
				return "月间视图 Monthly View";
			case ViewType.YearlyView:
				return "年间视图 Yearly View";
			case "Archive":
				return "归档上个月文件 Archive Last Month";
			default:
				throw new Error("Invalid choice");
		}
	}
}
