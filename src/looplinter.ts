import * as vscode from 'vscode';

export class LoopLinter implements vscode.CodeActionProvider {
    constructor(context: vscode.ExtensionContext) {
        const command = vscode.commands.registerCommand('loop-linter', async (range: vscode.Range) => {
            vscode.window.activeTextEditor?.document.save();
            const text = vscode.window.activeTextEditor?.document.getText(range);

            vscode.tasks.executeTask(
                new vscode.Task({ type: 'looplinter' },
                    vscode.TaskScope.Workspace,
                    'looplinter',
                    'Loop Linter'));
        });
        context.subscriptions.push(command);
    }

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        // for each diagnostic entry that has the matching `code`, create a code action command
        return context.diagnostics
            .filter(diagnostic => diagnostic.code === 'no-errors-detected')
            .map(diagnostic => this.createCommandCodeAction(diagnostic));
    }

    private createCommandCodeAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
        const text = vscode.window.activeTextEditor?.document.getText(diagnostic.range);
        const action = new vscode.CodeAction(`Install @types/${text} module...`, vscode.CodeActionKind.QuickFix);
        action.diagnostics = [ diagnostic ];
        action.isPreferred = true;
        action.command = {
            command: 'types-installer.installTypesModule',
            title: 'Learn more about emojis',
            tooltip: 'This will open the unicode emoji page.',
            arguments: [ diagnostic.range ] 
        };
        return action;
    }
}