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
		contentEl.createEl("h2", { text: "请选择一个选项" });

		const buttonContainer = contentEl.createDiv("button-container");

		const choices = ["日间视图", "月间视图", "年间视图"];

		choices.forEach((choice: "日间视图" | "月间视图" | "年间视图") => {
			const choiceButton = buttonContainer.createEl("button", {
				text: choice,
				cls: "mod-cta",
			});
			choiceButton.addEventListener("click", () => {
				void open3ColumnView(
					this.app,
					this.settings,
					this.choiceToViewType(choice)
				);
				this.close();
			});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	choiceToViewType(choice: string): ViewType {
		switch (choice) {
			case "日间视图":
				return ViewType.DailyView;
			case "月间视图":
				return ViewType.MonthlyView;
			case "年间视图":
				return ViewType.YearlyView;
			default:
				throw new Error("Invalid choice");
		}
	}
}
