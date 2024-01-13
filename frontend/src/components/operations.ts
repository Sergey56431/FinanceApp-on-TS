import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import * as bootstrap from 'bootstrap';
import {UrlManager} from '../utils/url-manager';
import {Balance} from "./balance";
import {GetOperationType} from "../types/get-operations.type";
import {DefaultResponseType} from "../types/default-response.type";
import {GetBalanceType} from "../types/get-balance.type";
import {DeletedResponseType} from "../types/deleted-response.type";
import {GetCategoryType} from "../types/get-category.type";


export class Operations {
    private createIncome: HTMLElement | null;
    private createExpense: HTMLElement | null;
    private balance: HTMLElement | null;
    private popupDeleteOperation: HTMLElement | null;
    private tableBody: HTMLElement | null;
    readonly buttonAll: HTMLElement | null;
    readonly buttonWeek: HTMLElement | null;
    readonly buttonMonth: HTMLElement | null;
    readonly buttonYear: HTMLElement | null;
    readonly buttonToday: HTMLElement | null;
    readonly buttonInterval: HTMLElement | null;
    private buttonIntervalFrom: HTMLInputElement | null;
    private buttonIntervalTo: HTMLInputElement | null;
    private buttons: NodeListOf<HTMLElement> | null;

    constructor() {
        this.createIncome = document.getElementById('createIncome');
        this.createExpense = document.getElementById('createExpense');
        this.balance = document.getElementById('balance');
        this.popupDeleteOperation = document.getElementById('delete-operation');
        this.tableBody = document.getElementById('tableBody');
        this.buttonAll = document.getElementById('btn-check-2-outlined-5');
        this.buttonWeek = document.getElementById('btn-check-2-outlined-2');
        this.buttonMonth = document.getElementById('btn-check-2-outlined-3');
        this.buttonYear = document.getElementById('btn-check-2-outlined-4');
        this.buttonToday = document.getElementById('btn-check-2-outlined-1');
        this.buttonInterval = document.getElementById('btn-check-2-outlined-6');
        this.buttonIntervalFrom = document.getElementById('date-begin') as HTMLInputElement;
        this.buttonIntervalTo = document.getElementById('date-over') as HTMLInputElement;
        this.buttons = document.querySelectorAll('.btn-check');

        UrlManager.getQueryParams();
        (() => {
            const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            tooltipTriggerList.forEach(tooltipTriggerEl => {
                new bootstrap.Tooltip(tooltipTriggerEl)
            })
        })()

        Balance.sending();
        // this.choiceOperation();
        this.getBalance();
        this.init();
    }

    private async init(): Promise<void> {
        const that: Operations = this;
        let from: string[];
        let to: string[];
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/login'
        }


        if (this.buttonAll && this.buttonYear && this.buttonMonth && this.buttonWeek && this.buttonToday) {
            this.buttonAll.onclick = () => getOperation('all');
            this.buttonYear.onclick = () => getOperation('year');
            this.buttonMonth.onclick = () => getOperation('month');
            this.buttonWeek.onclick = () => getOperation('week');
            this.buttonToday.onclick = () => getOperation('today');
        }

        async function getOperation(period: string) {
            try {
                const result: GetOperationType[] | DefaultResponseType = await CustomHttp.request(config.host + '/operations/?period=' + period);
                if (result) {
                    that.tableCreate(result as GetOperationType[]);

                }
            } catch (error) {
                console.log(error);
            }
        }

        if (this.buttonInterval) {
            this.buttonInterval.onclick = async function () {

            }
            if (that.buttonIntervalFrom && that.buttonIntervalTo) {
                from = that.buttonIntervalFrom.value.split('.');
                to = that.buttonIntervalTo.value.split('.');

                try {
                    const result = await CustomHttp.request(config.host + '/operations/?period=interval&dateFrom=' + from + '&dateTo=' + to);
                    if (result) {
                        that.tableCreate(result);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    private async getBalance(): Promise<void> {
        try {
            let balance: GetBalanceType | null = await CustomHttp.request(config.host + '/balance')
            if (balance) {
                localStorage.setItem("balance", JSON.stringify(balance.balance))
                if (this.balance) {
                    this.balance.innerText = localStorage.getItem('balance') + "$";
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    // private choiceOperation(): void {
    //     if (this.createExpense && this.createIncome){
    //         if (this.createIncome.onclick) {
    //             localStorage.setItem('incomePage', JSON.stringify(this.createIncome.value))
    //         }
    //         if (this.createExpense.onclick) {
    //             localStorage.setItem('expensePage', JSON.stringify(this.createExpense.value))
    //         }
    //     }
    // }

    private tableCreate(result: GetOperationType[] | undefined): void {
        const that: Operations = this
        let counter: number = 1
        if (!result) return;

        result.forEach((item: GetOperationType) => {
            if (this.buttons) {
                for (let i = 0; i < this.buttons.length; i++) {
                    this.buttons[i].addEventListener("click", function () {
                        if (item.id){
                            let tableItems: HTMLElement | null = document.getElementById(item.id.toString());
                            if (tableItems) {
                                tableItems.remove()
                            }
                        }
                    });
                }
                if (item) {

                    const tableItem: HTMLElement | null = document.createElement('tr');
                    if (item.id) {
                        tableItem.setAttribute('id', item.id.toString());
                        tableItem.className = 'tr-item';
                    }

                    const tableItemScope: HTMLElement | null = document.createElement('th');
                    tableItemScope.setAttribute('scope', 'row');
                    tableItemScope.innerText = counter.toString()

                    const tableItemType: HTMLElement | null = document.createElement('td');
                    tableItemType.className = 'link-success';
                    if (item.type === 'income' || item.type === 'доход') {
                        item.type = 'доход'
                        tableItemType.className = 'link-success';
                    } else if (item.type === 'expense' || item.type === 'расход') {
                        item.type = 'расход'
                        tableItemType.className = 'link-danger';
                    }
                    tableItemType.innerText = item.type;


                    const tableItemCategory: HTMLElement | null = document.createElement('td');
                    if (item.category) {
                        tableItemCategory.innerText = item.category;
                    }

                    const tableItemAmount: HTMLElement | null = document.createElement('td');
                    if (item.amount) {
                        tableItemAmount.innerText = item.amount + '$';
                    }

                    const tableItemDate: HTMLElement | null = document.createElement('td');
                    let res: string;
                    let str = item?.date?.toString();
                    let arr = str?.split('-');
                    if (arr) {
                        res = arr[2] + '.' + arr[1] + '.' + arr[0];
                        tableItemDate.innerText = res;
                    }

                    const tableItemComment: HTMLElement | null = document.createElement('td');
                    tableItemComment.innerText = item.comment as string;


                    const tableItemButton: HTMLElement | null = document.createElement('td');

                    const tableItemButtonElement: HTMLElement | null = document.createElement('a');
                    tableItemButtonElement.setAttribute('href', '#');
                    tableItemButtonElement.setAttribute('data-bs-toggle', 'modal');
                    tableItemButtonElement.setAttribute('data-bs-target', '#exampleModal');
                    tableItemButtonElement.className = 'btn-svg delete-btn';
                    tableItemButtonElement.innerHTML =
                        '<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="me-2">' +
                        '<path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z" fill="black"/>' +
                        '<path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z" fill="black"/>' +
                        '<path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z" fill="black"/>' +
                        '<path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z" fill="black"/>' +
                        '</svg>'

                    const tableItemButtonCreate: HTMLElement | null = document.createElement('a');
                    tableItemButtonCreate.setAttribute('href', '#/change-operation');
                    tableItemButtonCreate.className = 'edit-operation';
                    tableItemButtonCreate.innerHTML =
                        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"/>' +
                        '</svg>'

                    tableItem.appendChild(tableItemScope);
                    tableItem.appendChild(tableItemType);
                    tableItem.appendChild(tableItemCategory);
                    tableItem.appendChild(tableItemAmount);
                    tableItem.appendChild(tableItemDate);
                    tableItem.appendChild(tableItemComment);

                    tableItemButton.appendChild(tableItemButtonElement);
                    tableItemButton.appendChild(tableItemButtonCreate);

                    tableItem.appendChild(tableItemButton);

                    if (this.tableBody) {
                        this.tableBody.appendChild(tableItem);
                    }

                    const editOperationElements: NodeListOf<Element> = document.querySelectorAll('.edit-operation')
                    editOperationElements.forEach((item: any) => {
                        item.onclick = function () {
                            const type: string | null = item.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent
                            const category: string | null = item.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent
                            const amount: string | number | null = item.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.textContent
                            const date: string | null = item.parentElement.previousElementSibling.previousElementSibling.textContent
                            const comment: string | null = item.parentElement.previousElementSibling.textContent
                            const operationId: number | string | null = item.parentElement.parentElement.id
                            localStorage.setItem('Type', JSON.stringify(type))
                            localStorage.setItem('Category', JSON.stringify(category))
                            localStorage.setItem('Amount', JSON.stringify(amount))
                            localStorage.setItem('Date', JSON.stringify(date))
                            localStorage.setItem('Comment', JSON.stringify(comment))
                            localStorage.setItem('OperationId', JSON.stringify(operationId))
                        }
                    })

                    const deleteBtnElement: NodeListOf<HTMLElement> | null = document.querySelectorAll('.delete-btn')
                    deleteBtnElement.forEach((item: HTMLElement) => {
                        item.onclick = function () {
                            if (that.popupDeleteOperation) {
                                that.popupDeleteOperation.onclick = function () {
                                    let resultId: string | undefined = item?.parentElement?.parentElement?.id
                                    if (resultId) {
                                        try {
                                            const result: Promise<DeletedResponseType | DefaultResponseType> = CustomHttp.request(config.host + '/operations/' + resultId, "DELETE");
                                            if (result as unknown) {
                                                location.href = '#/operations'
                                            }
                                        } catch (error) {
                                            console.log(error);
                                        }
                                    }
                                }
                            }
                        }

                    })
                    counter += 1
                }
            }
        })
    }
}
