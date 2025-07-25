// src/app/app.component.ts

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import {
    Univer,
    ICommandService,
    IUniverInstanceService,
    type IWorkbookData,
    LocaleType,
    DataValidationType,
} from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
// Import the correct command and the logic plugin
import {
    UniverSheetsDataValidationPlugin,
    AddSheetDataValidationCommand,
} from '@univerjs/sheets-data-validation';
// THE REAL FIX: Import the mandatory UI plugin that solves the LocaleService runtime error
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
    @ViewChild('univerContainer') univerContainer!: ElementRef;
    univer!: Univer;
    workbookId = 'workbook-demo-checkbox';

    ngAfterViewInit(): void {
        const workbookData = this.createDemoWorkbookData();

        this.univer = new Univer({
            theme: defaultTheme,
            locale: LocaleType.EN_US,
        });

        // The registration order remains critical.
        this.univer.registerPlugin(UniverRenderEnginePlugin);
        this.univer.registerPlugin(UniverFormulaEnginePlugin);
        this.univer.registerPlugin(UniverDocsPlugin);
        this.univer.registerPlugin(UniverSheetsPlugin);
        this.univer.registerPlugin(UniverUIPlugin, {
            container: this.univerContainer.nativeElement,
            header: true,
            footer: true,
        });
        this.univer.registerPlugin(UniverDocsUIPlugin);
        this.univer.registerPlugin(UniverSheetsUIPlugin);
        this.univer.registerPlugin(UniverSheetsFormulaPlugin);

        // Register BOTH the logic and the UI plugins for data validation.
        this.univer.registerPlugin(UniverSheetsDataValidationPlugin);
        this.univer.registerPlugin(UniverSheetsDataValidationUIPlugin);

        this.univer.createUniverSheet(workbookData);

        this.addCheckboxValidation();
    }

    private addCheckboxValidation(): void {
        const injector = this.univer.__getInjector();
        const commandService = injector.get(ICommandService);
        const univerInstanceService = injector.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(this.workbookId);
        if (!workbook) return;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        commandService.executeCommand(AddSheetDataValidationCommand.id, {
            unitId,
            subUnitId,
            rule: {
                type: DataValidationType.CHECKBOX,
                ranges: [{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 }],
                rule: {
                    checkedValue: true,
                    uncheckedValue: false,
                },
            },
        });
    }

    private createDemoWorkbookData(): IWorkbookData {
        return {
            id: this.workbookId,
            name: 'Univer Docs',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet-01'],
            sheets: {
                'sheet-01': {
                    id: 'sheet-01',
                    name: 'To-Do List',
                    cellData: {
                        '0': { '0': { v: true }, '1': { v: 'Write report' } },
                        '1': { '0': { v: false }, '1': { v: 'Email the team' } },
                        '2': { '0': { v: false }, '1': { v: 'Schedule meeting' } },
                    },
                },
            },
        };
    }
}