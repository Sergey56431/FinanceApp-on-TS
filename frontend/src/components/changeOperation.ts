import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {Balance} from "./balance";
import {UserInfoType} from "../types/userInfo.type";
import {GetCategoryType} from "../types/get-category.type";
import {DefaultResponseType} from "../types/default-response.type";
import {GetOperationType} from "../types/get-operations.type";
import {PutBalanceType} from "../types/get-balance.type";

export class ChangeOperation {
    readonly typeField: HTMLSelectElement | null;
    readonly categoryField: HTMLSelectElement | null;
    private sumField: HTMLInputElement | null;
    private dateField: HTMLInputElement | null;
    private commentField: HTMLInputElement | null;
    private balanceToChange: number;
    private category: number | null;
    private saveBtn: HTMLElement | null;
    private dif: number;
    private nowBalance: number;
    private amount: string | null;
    private balance: string | null;

    constructor() {
        this.typeField = document.getElementById('typeField') as HTMLSelectElement;
        this.categoryField = document.getElementById('categoryField') as HTMLSelectElement;
        this.sumField = document.getElementById('sumField') as HTMLInputElement;
        this.dateField = document.getElementById('dateField') as HTMLInputElement;
        this.commentField = document.getElementById('commentField') as HTMLInputElement;
        this.saveBtn = document.getElementById('createBtn');
        this.balanceToChange = 0;
        this.category = null;
        this.dif = 0;
        this.nowBalance = 0;
        this.amount = localStorage.getItem('Amount');
        this.balance = localStorage.getItem('balance');

        Balance.sending();
        this.init()
    }

    private async init(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/login';
        }

        let type: string | null = localStorage.getItem('Type')
        if (type) {
            type = type.replace(/[^а-яёa-z]/gi, ' ');
            type = type.replace(/\s+/g, ' ').trim();
        }

        let category: string | null = localStorage.getItem('Category')
        if (category) {
            category = category.replace(/[^а-яёa-z1-9]/gi, ' ');
            category = category.replace(/\s+/g, ' ').trim();
        }


        try {
            const result: GetCategoryType [] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income');

            (result as GetCategoryType[]).forEach(item => {
                const option = document.createElement('option')
                option.setAttribute('value', item.title);
                option.setAttribute('id', item.id.toString());
                option.className = 'option-element';
                option.innerText = item.title;

                if (this.typeField) {
                    let indexSelected: number | null = this.typeField.selectedIndex,
                        options: HTMLOptionElement | null = this.typeField.querySelectorAll('option')[indexSelected];

                    let selectedId = options.getAttribute('id');
                    if (selectedId === 'one') {
                        option.style.display = 'block';
                    } else {
                        option.style.display = 'none';
                    }

                    if (this.categoryField) {
                        this.categoryField.appendChild(option);
                    }

                    this.typeField.addEventListener('change', (e) => {
                        if (this.typeField && this.categoryField) {
                            if (this.typeField.value === 'expense') {
                                option.style.display = 'none';
                                this.categoryField.value = ' ';
                            } else {
                                option.style.display = 'block';
                            }
                        }
                    })
                }
            })

            if (type === 'доход') {
                (result as GetCategoryType[]).forEach(item => {
                    if (item.title === category) {
                        if (this.categoryField) {
                            this.categoryField.value = category;
                            this.category = item.id;
                            return this.category;
                        }
                    }
                })
            }
            if (this.categoryField) {
                this.categoryField.addEventListener('change', (e) => {
                    (result as GetCategoryType[]).forEach((item: GetCategoryType) => {
                        if (this.categoryField) {
                            if (item.title && this.categoryField.value === item.title) {
                                this.category = item.id
                                return this.category
                            }
                        }
                    })
                })
            }

            const resultExpense: GetCategoryType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/expense');
            if (type === 'доход') {
                (resultExpense as GetCategoryType[]).forEach(item => {
                    if (item.title === category && this.categoryField) {
                        this.categoryField.value = item.title
                    }
                })
            }

            (result as GetCategoryType[]).forEach((itemExp: GetCategoryType) => {
                const optionExp: HTMLOptionElement | null = document.createElement('option')
                optionExp.setAttribute('value', itemExp.title);
                optionExp.setAttribute('id', itemExp.id.toString());
                optionExp.className = 'option-element-exp';
                optionExp.innerText = itemExp.title

                if (this.typeField) {
                    let indexSelected = this.typeField.selectedIndex,
                        option = this.typeField.querySelectorAll('option')[indexSelected];

                    let selectedId = option.getAttribute('id');

                    if (selectedId === 'two') {
                        optionExp.style.display = 'block'
                    } else {
                        optionExp.style.display = 'none'
                    }

                    if (this.categoryField) {
                        this.categoryField.appendChild(optionExp)
                        this.typeField.addEventListener('change', (e) => {

                            if (this.typeField && this.categoryField && this.typeField.value === 'income') {
                                optionExp.style.display = 'none'
                                this.categoryField.value = ' '
                            } else {
                                optionExp.style.display = 'block'
                            }
                        })
                    }
                }

            })

            if (type === 'расход') {
                (resultExpense as GetCategoryType[]).forEach(item => {
                    if (item.title === category) {
                        if (this.categoryField) {
                            this.categoryField.value = category
                            this.category = item.id
                            return this.category
                        }
                    }
                })
            }
            if (this.categoryField) {
                this.categoryField.addEventListener('change', (e) => {
                    (resultExpense as GetCategoryType[]).forEach((item: GetCategoryType) => {
                        if (item.title && this.categoryField && this.categoryField.value === item.title) {
                            this.category = item.id
                            return this.category
                        }
                    })
                })
            }

        } catch (error) {
            console.log(error);
        }
        this.addInputNameOperations();
        this.editOperation();
    }

    private addInputNameOperations(): void {

        let type: string | null = localStorage.getItem('Type')
        let date: string | null = localStorage.getItem('Date')
        let comment: string | null = localStorage.getItem('Comment')
        if (type) {
            type = type.replace(/[^а-яёa-z]/gi, ' ');
            type = type.replace(/\s+/g, ' ').trim();
        }
        if (this.amount) {
            this.amount = this.amount.replace(/[^0-9]/gi, ' ');
            this.amount = this.amount.replace(/\s+/g, ' ').trim();
        }

        if (date) {
            date = date.replace(/[^0-9.]/gi, ' ');
            date = date.replace(/\s+/g, ' ').trim();
            let dateArr: string[] | null = date.split('.')
            date = dateArr[2] + '-' + dateArr [1] + '-' + dateArr[0]
        }

        if (comment) {
            comment = comment.replace(/[^а-яёa-z1-9]/gi, ' ');
            comment = comment.replace(/\s+/g, ' ').trim();
        }

        if (type === 'доход' && this.typeField) {
            this.typeField.value = 'income'
        } else if (this.typeField) {
            this.typeField.value = 'expense'
        }
        if (this.sumField) {
            (this.sumField as HTMLInputElement).value = this.amount as string
        }
        if (this.dateField) {
            (this.dateField as HTMLInputElement).value = date as string

        }
        if (this.commentField) {
            (this.commentField as HTMLInputElement).value = comment as string
        }

    }

    private editOperation(): void {
        const that: ChangeOperation = this
        let operationId: string | null = localStorage.getItem('OperationId')
        if (operationId) {
            JSON.parse(operationId)
            operationId = operationId.replace(/[^1-9]/gi, ' ');
            operationId = parseInt(operationId).toString()
            if (this.saveBtn) {
                this.saveBtn.onclick = async function () {
                    const userInfo: UserInfoType | null = Auth.getUserInfo();
                    if (!userInfo) {
                        location.href = '#/login'
                    }
                    that.changeBalance();
                    try {
                        const result: GetOperationType | DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + operationId, "PUT", {
                            type: (that.typeField as HTMLSelectElement).value,
                            category_id: that.category,
                            amount: (that.sumField as HTMLInputElement).value,
                            date: (that.dateField as HTMLInputElement).value,
                            comment: (that.commentField as HTMLInputElement).value
                        });
                        if (result) {
                            location.href = '#/operations'
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
                that.removeLocalStorage()
            }
        }
    }


    private async changeBalance(): Promise<void> {
        let money: number | null = Number(this.amount);
        let nowBalance: number | null =  Number(this.balance);
        if (money) {
            this.dif = money - Number((this.sumField as HTMLInputElement).value);
            if (this.balance) {
                if (this.typeField && this.typeField.value === 'income') {
                    if (this.dif !== 0) {
                        this.dif = -this.dif;
                        this.balanceToChange = nowBalance + this.dif;
                    }
                }
                if (this.typeField && this.typeField.value === 'expense') {
                    if (this.dif !== 0) {
                        this.dif = -this.dif;
                        this.balanceToChange = nowBalance - this.dif;
                    }
                }
            }
        }
        let putBalance: PutBalanceType | DefaultResponseType = await CustomHttp.request(config.host + '/balance', "PUT", {
            newBalance: this.balanceToChange
        })
        JSON.stringify(putBalance)
    }

    private removeLocalStorage(): void {
        localStorage.removeItem('Type');
        localStorage.removeItem('Amount');
        localStorage.removeItem('Date');
        localStorage.removeItem('Comment');
        localStorage.removeItem('Category');
        localStorage.removeItem('OperationId');
    }
}
