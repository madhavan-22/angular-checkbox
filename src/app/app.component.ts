// src/app/app.component.ts

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
// THE REAL FIX: The Facade API is the ONLY entry point we need.
import { FUniver, UniverInstanceType } from '@univerjs/facade';
import type { IWorkbookData } from '@univerjs/core';
import { AddDataValidationMutation } from '@univerjs/sheets-data-validation';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
    @ViewChild('univerContainer') univerContainer!: ElementRef;
    univerAPI: any;
    workbookId = 'workbook-demo-checkbox';

    ngAfterViewInit(): void {
        const workbookData = this.createDemoWorkbookData();

        // THE FINAL SOLUTION: The Facade API handles EVERYTHING.
        // It creates the Univer instance, registers all necessary plugins,
        // and sets up locales internally. This is the one-line solution.
        this.univerAPI = FUniver.newAPI({
            container: this.univerContainer.nativeElement,
            header: true,
            footer: true,
        });

        // Use the API object to create the sheet.
        const workbook = this.univerAPI.createUnit(UniverInstanceType.UNIVER_SHEET, workbookData);

        // Pass the workbook facade to our function.
        this.addCheckboxValidation(workbook);
    }

    private addCheckboxValidation(workbook: any): void {
        // Get the command service directly from the workbook facade.
        const commandService = workbook.getCommandService();
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        commandService.executeCommand(AddDataValidationMutation.id, {
            unitId,
            subUnitId,
            rule: {
                type: 'checkbox',
                ranges: [{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 }],
                rule: { checkedValue: true, uncheckedValue: false },
            },
        });
    }

    private createDemoWorkbookData(): Partial<IWorkbookData> {
        // The facade's `createUnit` method uses a Partial type, so we don't need all properties.
        return {
            id: this.workbookId,
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