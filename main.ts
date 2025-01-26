import { App, Modal, Notice, Plugin, TFile, TFolder } from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addStyles();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"scroll",
			"Hat Daily",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("开启帽子日记视图");
				new ViewSelectorModal(this.app).open();
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");
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

class ViewSelectorModal extends Modal {
	constructor(app: App) {
		super(app);
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
				// 点击选项后的操作
				new Notice(`你选择了: ${choice}`);
				// 关闭模态对话框
				this.close();
			});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	async openChoiceView(choice: "日间视图" | "月间视图" | "年间视图") {
		const todayDate = window.moment().format("YYYY-MM-DD");
		const currentMonth = window.moment().format("YYYY-MM");
		const currentYear = window.moment().format("YYYY");
		const recentNote = await this.getRecentNote(choice);

		const templateName: string | null = this.getTemplate(choice);

		switch (choice) {
			case "日间视图":
				await this.openTriplePane(
					recentNote,
					await this.getOrCreateNoteFile(todayDate, templateName),
					await this.getOrCreateNoteFile(currentMonth, templateName)
				);
				break;
			case "月间视图":
				await this.openTriplePane(
					recentNote,
					await this.getOrCreateNoteFile(currentMonth, templateName),
					await this.getOrCreateNoteFile(currentYear, templateName)
				);
				break;
			case "年间视图":
				await this.openTriplePane(
					recentNote,
					await this.getOrCreateNoteFile(currentYear, templateName),
					null
				);
				break;
		}
	}

	async openTriplePane(
		leftFile: TFile | null,
		middleFile: TFile | null,
		rightFile: TFile | null
	) {
		// 清除现有的叶子
		await this.app.workspace.detachLeavesOfType("markdown");

		// 创建三个分栏
		const leftPane = await this.app.workspace.getLeaf();
		const middlePane = await this.app.workspace.createLeafBySplit(
			leftPane,
			"vertical"
		);
		const rightPane = await this.app.workspace.createLeafBySplit(
			middlePane,
			"vertical"
		);

		// 在左侧加载最近的日记，如果没有则显示为空
		if (leftFile) {
			await leftPane.openFile(leftFile);
		} else {
			leftPane.setViewState({ type: "empty" });
		}

		// 在中间加载今天的日记，如果没有则显示为空
		if (middleFile) {
			await middlePane.openFile(middleFile);
		} else {
			middlePane.setViewState({ type: "empty" });
		}

		// 在右侧加载当前月份的日记，如果没有则显示为空
		if (rightFile) {
			await rightPane.openFile(rightFile);
		} else {
			rightPane.setViewState({ type: "empty" });
		}
	}

	getFormat(type: "日间视图" | "月间视图" | "年间视图") {
		switch (type) {
			case "日间视图":
				return "YYYY-MM-DD";
			case "月间视图":
				return "YYYY-MM";
			case "年间视图":
				return "YYYY";
		}
	}

	getTemplate(type: "日间视图" | "月间视图" | "年间视图") {
		switch (type) {
			case "日间视图":
				return "Template-Daily";
			case "月间视图":
				return "Template-Monthly";
			case "年间视图":
				return "Template-Yearly";
			default:
				throw new Error(`Unsupported type: ${type}`);
		}
	}

	createRegex(format: string): RegExp {
		switch (format) {
			case "YYYY":
				return /^\d{4}$/;
			case "YYYY-MM":
				return /^\d{4}-\d{2}$/;
			case "YYYY-MM-DD":
				return /^\d{4}-\d{2}-\d{2}$/;
			default:
				throw new Error(`Unsupported format: ${format}`);
		}
	}

	async getRecentNote(type: "日间视图" | "月间视图" | "年间视图") {
		const format = this.getFormat(type);
		const nowDate = window.moment().format(format);
		const regex = this.createRegex(format);

		// 获取所有日记文件
		const allDailyNotes = this.app.vault
			.getFiles()
			.filter((file) => file.path.startsWith("Daily/"))
			.filter((file) => regex.test(file.basename));

		// 找到最近的日记文件
		let recentNote = null;
		let recentDate = window.moment("0000-01-01", format);
		for (const file of allDailyNotes) {
			const basename = file.basename;
			if (basename === nowDate || file instanceof TFolder) {
				continue;
			}
			const fileDate = window.moment(basename, format);
			if (fileDate.isAfter(recentDate)) {
				recentDate = fileDate;
				recentNote = file;
			}
		}

		return recentNote;
	}

	async getOrCreateNoteFile(date: string, templateName: string | null) {
		const allDailyNotes = this.app.vault
			.getFiles()
			.filter((file) => file.path.startsWith("Daily/"));
		let foundNote = null;
		for (const file of allDailyNotes) {
			const dateStr = file.basename;
			if (dateStr !== date || file instanceof TFolder) {
				continue;
			}
			foundNote = file;
			break;
		}
		let templateNote = null;
		if (templateName) {
			for (const file of this.app.vault.getFiles()) {
				const dateStr = file.basename;
				if (dateStr === templateName || file instanceof TFolder) {
					templateNote = file;
					break;
				}
			}
		}
		if (!foundNote) {
			const notePath = `Daily/${date}.md`;
			let dailyTemplateText = null;
			if (!!templateName && !templateNote) {
				new Notice(`未找到模板，请创建一个名为 ${templateName} 的模版`);
			} else if (!!templateNote) {
				dailyTemplateText = await this.app.vault.read(templateNote);
			} else {
				console.log(`Error: 模版名为空： ${templateName}`);
			}
			await this.app.vault.create(notePath, dailyTemplateText ?? "");
			foundNote = this.app.vault.getAbstractFileByPath(notePath);
		}
		if (foundNote instanceof TFile) return foundNote;
		else return null;
	}
}
