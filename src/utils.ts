import { App, Notice, TFile, TFolder } from "obsidian";
import { HatDailyPluginSettings, ViewType } from "./interface";

export async function openTriplePane(
	app: App,
	leftFile: TFile | null,
	middleFile: TFile | null,
	rightFile: TFile | null
) {
	console.log("openTriplePane");
	// 清除现有的叶子
	await app.workspace.detachLeavesOfType("markdown");

	// 创建三个分栏
	const leftPane = app.workspace.getLeaf();
	const middlePane = app.workspace.createLeafBySplit(leftPane, "vertical");
	const rightPane = app.workspace.createLeafBySplit(middlePane, "vertical");

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

export async function getRecentNote(
	app: App,
	type: ViewType,
	dailyFolderPath: string,
	settings: HatDailyPluginSettings
) {
	const format = getFormat(type, settings);
	const nowDate = window.moment().format(format);
	// 获取所有日记文件
	const allDailyNotes = getFilesInFolder(app, dailyFolderPath);

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

export async function getOrCreateNoteFile(
	app: App,
	date: string,
	templatePath: string | null,
	dailyFolderPath: string
) {
	const allDailyNotes = getFilesInFolder(app, dailyFolderPath);
	let foundNote = null;
	for (const file of allDailyNotes) {
		const dateStr = file.basename;
		if (dateStr !== date || file instanceof TFolder) {
			continue;
		}
		foundNote = file;
		break;
	}
	let templateNote: TFile | null = null;
	if (templatePath) {
		let fixedPath = templatePath;
		if (!fixedPath.endsWith(".md")) {
			fixedPath += ".md";
		}
		const found = app.vault.getAbstractFileByPath(fixedPath);

		if (found instanceof TFile) {
			templateNote = found;
		}
		console.log(
			`templatePath ${templatePath} templateNote ${templateNote}`
		);
	}
	if (!foundNote) {
		const notePath = `${dailyFolderPath}/${date}.md`;
		let dailyTemplateText = null;
		if (!!templatePath && !templateNote) {
			new Notice(`未找到模板，请检查路径：${templatePath}`);
		} else if (templateNote) {
			dailyTemplateText = await app.vault.read(templateNote);
		}
		await app.vault.create(notePath, dailyTemplateText ?? "");
		foundNote = app.vault.getAbstractFileByPath(notePath);
	}
	if (foundNote instanceof TFile) return foundNote;
	else return null;
}

function getFormat(type: ViewType, settings: HatDailyPluginSettings) {
	switch (type) {
		case "日间视图":
			return settings.dailyFileFormat;
		case "月间视图":
			return settings.monthlyFileFormat;
		case "年间视图":
			return settings.yearlyFileFormat;
	}
}

export function getTemplate(type: ViewType, settings: HatDailyPluginSettings) {
	switch (type) {
		case "日间视图":
			return settings.dailyTemplatePath;
		case "月间视图":
			return settings.monthlyTemplatePath;
		case "年间视图":
			return settings.yearlyTemplatePath;
		default:
			throw new Error(`Unsupported type: ${type}`);
	}
}

export function createRegex(format: string): RegExp {
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

function getFilesInFolder(app: App, folderPath: string): TFile[] {
	const files = app.vault
		.getFiles()
		.filter((file) => file.path.startsWith(folderPath));
	return files;
}
