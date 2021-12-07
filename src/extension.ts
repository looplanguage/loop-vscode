// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LoopLinter } from './looplinter';

// Not perfect but should work for a lot of scenarios
async function shouldMark(testString: string) {
	console.log(testString);
	
	if (testString.includes('var')) {
		
	}

	return false;
}

async function getDiagnostics(doc: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
	const text = doc.getText();
	const diagnostics = new Array<vscode.Diagnostic>();

	const textArr: string[] = text.split(/\r\n|\n/);
	const indexOfFirstDep = textArr.findIndex((value: string) => new RegExp(`\s*"dependencies"`).test(value)) + 1;

	if(indexOfFirstDep !== -1) {
		let i = indexOfFirstDep;
		while (textArr.length > i && !/\s*}/.test(textArr[i])) {
			const arr = /\s*"(.*)"\s*:/.exec(textArr[i]);
			if(!arr) {
				i++;
				continue;
			}
			const key = arr[1];
			const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
			const nodeModulePath = vscode.Uri.joinPath(folder!.uri, 'node_modules', key);

			if (await shouldMark(textArr[i])) {
				const start = textArr[i].indexOf(key);
				const end = start + key.length;
				diagnostics.push({
					severity: vscode.DiagnosticSeverity.Error,
					message: `"Error" detected.`,
					code: 'Error-detected',
					source: 'Loop Linter',
					range: new vscode.Range(i, start, i, end)
				});
			}
			i++;
		}
	}

	return diagnostics;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('loop-linter');
	
	const handler = async (doc: vscode.TextDocument) => {
		if(!doc.fileName.endsWith('.lp') && !doc.fileName.endsWith('.loop')) {
			return;
		}
	
		const diagnostics = await getDiagnostics(doc);
		diagnosticCollection.set(doc.uri, diagnostics);
	};
	
	const didOpen = vscode.workspace.onDidOpenTextDocument(doc => handler(doc));
	const didChange = vscode.workspace.onDidChangeTextDocument(e => handler(e.document));
	const codeActionProvider = vscode.languages.registerCodeActionsProvider('loop', new LoopLinter(context));
	
	// If we have an activeTextEditor when we open the workspace, trigger the handler
	if (vscode.window.activeTextEditor) {
		await handler(vscode.window.activeTextEditor.document);
	}
	
	// Push all of the disposables that should be cleaned up when the extension is disabled
	context.subscriptions.push(
		diagnosticCollection,
		didOpen,
		didChange,
		codeActionProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {}