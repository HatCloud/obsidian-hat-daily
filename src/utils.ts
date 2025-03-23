import { App, Notice, TFile, TFolder, WorkspaceLeaf } from "obsidian";
import { HatDailyPluginSettings, ViewType } from "./interface";

export async function open3ColumnView(
	app: App,
	settings: HatDailyPluginSettings,
	viewType: ViewType
) {
	const dailyFolderPath = settings.dailyFolderPath;
	if (!dailyFolderPath) {
		new Notice("请先设置日记根目录");
		return;
	}
	const todayDate = window.moment().format(settings.dailyFileFormat);
	const currentMonth = window.moment().format(settings.monthlyFileFormat);
	const currentYear = window.moment().format(settings.yearlyFileFormat);
	const recentNote = await getRecentNote(
		app,
		viewType,
		dailyFolderPath,
		settings
	);

	const templatePath: string | null = getTemplate(viewType, settings);
	let rightViewType: ViewType | null = null;
	switch (viewType) {
		case ViewType.DailyView:
			rightViewType = ViewType.MonthlyView;
			break;
		case ViewType.MonthlyView:
			rightViewType = ViewType.YearlyView;
			break;
		case ViewType.YearlyView:
			rightViewType = null;
			break;
	}
	const rightTemplatePath: string | null = rightViewType
		? getTemplate(rightViewType, settings)
		: null;

	switch (viewType) {
		case ViewType.DailyView:
			await openTriplePane(
				app,
				recentNote,
				await getOrCreateNoteFile(
					app,
					todayDate,
					templatePath,
					dailyFolderPath
				),
				await getOrCreateNoteFile(
					app,
					currentMonth,
					rightTemplatePath,
					dailyFolderPath
				)
			);
			break;
		case ViewType.MonthlyView:
			await openTriplePane(
				app,
				recentNote,
				await getOrCreateNoteFile(
					app,
					currentMonth,
					templatePath,
					dailyFolderPath
				),
				await getOrCreateNoteFile(
					app,
					currentYear,
					rightTemplatePath,
					dailyFolderPath
				)
			);
			break;
		case ViewType.YearlyView:
			await openTriplePane(
				app,
				recentNote,
				await getOrCreateNoteFile(
					app,
					currentYear,
					templatePath,
					dailyFolderPath
				),
				null
			);
			break;
	}
}

/**
 * 归档上个月的文件；具体细节如下
 * 1. 在 ViewSelectorModal 中添加一个选项：归档上个月文件
 * 2. 用户按下按钮后，将上个月的文件移动到以上个月命名的文件夹中
 * 3. 上个月的文件具体指的是月份文件（2025-01）和每一天的文件（2025-01-01，2025-01-02...）具体命名需要和设置中的格式模版有关
 * 4. 归档到的文件夹是在设置中的根目录下的 年份/月份 这样的方式组织
 */
export async function archiveLastMonth(
	app: App,
	settings: HatDailyPluginSettings
) {
	const dailyFolderPath = settings.dailyFolderPath;
	if (!dailyFolderPath) {
		new Notice("Please set the daily folder path first.");
		return;
	}
	const lastMonth = window
		.moment()
		.subtract(1, "month")
		.format(settings.monthlyFileFormat);
	const lastMonthYear = window
		.moment()
		.subtract(1, "month")
		.format(settings.yearlyFileFormat);
	const lastMonthFolder = `${dailyFolderPath}/${lastMonthYear}/${lastMonth}`;
	const allDailyNotes = getFilesInFolder(app, dailyFolderPath);
	const dailyFileFormat = getFormat(ViewType.DailyView, settings);
	const monthlyFileFormat = getFormat(ViewType.MonthlyView, settings);
	const yearlyFileFormat = getFormat(ViewType.YearlyView, settings);
	const lastMonthStart = window
		.moment()
		.subtract(1, "month")
		.startOf("month");
	const lastMonthEnd = window.moment().subtract(1, "month").endOf("month");

	const lastMonthFiles = allDailyNotes.filter((file) => {
		if (file instanceof TFolder) return false;
		const parsedDate = window.moment(file.basename, dailyFileFormat, true);
		if (!parsedDate.isValid()) return false;
		return parsedDate.isBetween(
			lastMonthStart,
			lastMonthEnd,
			undefined,
			"[]"
		);
	});

	const lastMonthFile = allDailyNotes.find((file) => {
		if (file instanceof TFolder) return false;
		const parsedDate = window.moment(
			file.basename,
			monthlyFileFormat,
			true
		);
		if (!parsedDate.isValid()) return false;
		return parsedDate.isSame(lastMonthStart, "month");
	});

	if (lastMonthFiles.length === 0 && !lastMonthFile) {
		new Notice(`There is no file to archive for ${lastMonth}`);
		return;
	}
	const lastMonthFolderExists =
		app.vault.getAbstractFileByPath(lastMonthFolder);
	if (!lastMonthFolderExists) {
		await app.vault.createFolder(lastMonthFolder);
	}
	for (const file of lastMonthFiles) {
		if (file instanceof TFolder) continue;
		const basename = file.basename;
		const targetPath = `${lastMonthFolder}/${basename}.md`;
		await app.vault.rename(file, targetPath);
	}
	if (lastMonthFile) {
		const targetPath = `${lastMonthFolder}/${lastMonth}.md`;
		await app.vault.rename(lastMonthFile, targetPath);
	}

	const currentYear = window.moment().format(settings.yearlyFileFormat);
	for (const file of allDailyNotes) {
		const parsedDate = window.moment(file.basename, yearlyFileFormat, true);
		if (parsedDate.isValid() && parsedDate.format("YYYY") !== currentYear) {
			const yearFolder = `${dailyFolderPath}/${parsedDate.format(
				"YYYY"
			)}`;
			const yearFolderExists =
				app.vault.getAbstractFileByPath(yearFolder);
			if (!yearFolderExists) {
				await app.vault.createFolder(yearFolder);
			}
			const targetPath = `${yearFolder}/${file.basename}.md`;
			await app.vault.rename(file, targetPath);
		}
	}

	new Notice(`Archived files to ${lastMonthFolder}`);
}

export async function openTriplePane(
	app: App,
	leftFile: TFile | null,
	middleFile: TFile | null,
	rightFile: TFile | null
) {
	// 清除根分栏中的所有叶子
	await this.app.workspace.iterateRootLeaves((leaf: WorkspaceLeaf) => {
		leaf.detach();
	});

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
	const now = window.moment();

	// 根据视图类型计算目标基准时间
	let targetDate = now.clone();
	switch (type) {
		case ViewType.DailyView:
			targetDate = now.subtract(1, "day").startOf("day"); // 昨日
			break;
		case ViewType.MonthlyView:
			targetDate = now.subtract(1, "month").startOf("month"); // 上月
			break;
		case ViewType.YearlyView:
			targetDate = now.subtract(1, "year").startOf("year"); // 去年
			break;
	}

	const allDailyNotes = getFilesInFolder(app, dailyFolderPath);

	let recentNote: TFile | null = null;
	let closestDiff = Infinity; // 记录最小时间差

	for (const file of allDailyNotes) {
		if (file instanceof TFolder) continue;

		// 严格校验日期格式
		const parsedDate = window.moment(file.basename, format, true);
		if (!parsedDate.isValid()) continue;

		// 计算与目标日期的绝对时间差（毫秒）
		const diff = Math.abs(targetDate.diff(parsedDate));

		// 只接受早于等于当前周期的笔记（排除未来笔记）
		if (parsedDate.isAfter(targetDate)) continue;

		// 寻找最接近目标日期的笔记
		if (diff < closestDiff) {
			closestDiff = diff;
			recentNote = file;
		}
	}

	console.log(
		`getRecentNote: [${type} View] Target: ${targetDate.format(
			format
		)}, Found: ${recentNote?.basename}`
	);
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
	}
	if (!foundNote) {
		const notePath = `${dailyFolderPath}/${date}.md`;
		let dailyTemplateText = null;
		if (!!templatePath && !templateNote) {
			new Notice(`未找到模板，请检查路径：${templatePath}`);
		} else if (templateNote) {
			dailyTemplateText = await app.vault.cachedRead(templateNote);
		}
		await app.vault.create(notePath, dailyTemplateText ?? "");
		foundNote = app.vault.getAbstractFileByPath(notePath);
	}
	if (foundNote instanceof TFile) return foundNote;
	else return null;
}

function getFormat(type: ViewType, settings: HatDailyPluginSettings) {
	switch (type) {
		case ViewType.DailyView:
			return settings.dailyFileFormat;
		case ViewType.MonthlyView:
			return settings.monthlyFileFormat;
		case ViewType.YearlyView:
			return settings.yearlyFileFormat;
	}
}

export function getTemplate(type: ViewType, settings: HatDailyPluginSettings) {
	switch (type) {
		case ViewType.DailyView:
			return settings.dailyTemplatePath;
		case ViewType.MonthlyView:
			return settings.monthlyTemplatePath;
		case ViewType.YearlyView:
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

import { AbstractInputSuggest } from "obsidian";

export class FileSuggest extends AbstractInputSuggest<string> {
	private inputEl: HTMLInputElement;
	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.inputEl = inputEl;
	}

	getSuggestions(inputStr: string): string[] {
		const files = this.app.vault.getFiles();
		const lowerCaseInputStr = inputStr.toLowerCase();
		return files
			.map((file) => file.path)
			.filter((path) => path.toLowerCase().includes(lowerCaseInputStr));
	}

	renderSuggestion(filePath: string, el: HTMLElement): void {
		el.setText(filePath);
	}

	selectSuggestion(filePath: string, evt: MouseEvent | KeyboardEvent): void {
		this.inputEl.value = filePath;
		this.inputEl.dispatchEvent(new Event("input")); // 手动触发 onChange
		this.inputEl.blur();
		this.close();
	}
}

export class FolderSuggest extends AbstractInputSuggest<string> {
	private inputEl: HTMLInputElement;
	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.inputEl = inputEl;
	}

	getSuggestions(inputStr: string): string[] {
		const folders: TFolder[] = [];
		this.app.vault.getAllLoadedFiles().forEach((file) => {
			if (file instanceof TFolder) {
				folders.push(file);
			}
		});
		const lowerCaseInputStr = inputStr.toLowerCase();
		return folders
			.map((folder) => folder.path)
			.filter((path) => path.toLowerCase().includes(lowerCaseInputStr));
	}

	renderSuggestion(folderPath: string, el: HTMLElement): void {
		el.setText(folderPath);
	}

	selectSuggestion(
		folderPath: string,
		evt: MouseEvent | KeyboardEvent
	): void {
		this.inputEl.value = folderPath;
		this.inputEl.dispatchEvent(new Event("input")); // 手动触发 onChange
		this.inputEl.blur();
		this.close();
	}
}
