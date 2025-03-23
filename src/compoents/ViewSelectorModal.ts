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
		contentEl.createEl("h2", { text: "Choose" });

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
				return "Daily View";
			case ViewType.MonthlyView:
				return "Monthly View";
			case ViewType.YearlyView:
				return "Yearly View";
			case "Archive":
				return "Archive Last Month";
			default:
				throw new Error("Invalid choice");
		}
	}
}
