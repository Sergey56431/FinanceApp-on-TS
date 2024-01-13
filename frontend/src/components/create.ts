import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "./balance";
import {DefaultResponseType} from "../types/default-response.type";
import {UserInfoType} from "../types/userInfo.type";
import {GetCategoryType} from "../types/get-category.type";
import {PostOperationType} from "../types/post-operations.type";

export class Create {
    readonly newCreateTypeOperation: HTMLSelectElement | null;
    readonly newCreateCategoryOperation: HTMLSelectElement | null;
    private newCreateAmountOperation: HTMLInputElement | null;
    private newCreateDateOperation: HTMLInputElement | null;
    private newCreateCommentOperation: HTMLInputElement | null;
    private balanceToChange: number;
    private category: number | null;
    private saveNewCreateOperation: HTMLElement | null;

    constructor() {
        this.newCreateTypeOperation = document.getElementById('typeField') as HTMLSelectElement;
        this.newCreateCategoryOperation = document.getElementById('categoryField') as HTMLSelectElement;
        this.newCreateAmountOperation = document.getElementById('sumField') as HTMLInputElement;
        this.newCreateDateOperation = document.getElementById('dateField') as HTMLInputElement;
        this.newCreateCommentOperation = document.getElementById('commentField') as HTMLInputElement;
        this.saveNewCreateOperation = document.getElementById('createBtn');
        this.category = null;
        this.balanceToChange = 0;

        Balance.sending();
        this.Categories();
    }

    private async Categories(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/login';
        }
        try {
            const result: GetCategoryType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income');
            if (result as GetCategoryType[]) {
            }
            (result as GetCategoryType[]).forEach(item => {
                const option: HTMLElement | null = document.createElement('option');
                option.setAttribute('value', item.title);
                option.setAttribute('id', item.id.toString());
                option.className = 'option-element';
                option.innerText = item.title;

                if (this.newCreateTypeOperation && this.newCreateCategoryOperation) {
                    let indexSelected = this.newCreateTypeOperation.selectedIndex,
                        options = this.newCreateTypeOperation.querySelectorAll('option')[indexSelected];

                    let selectedId = options.getAttribute('id');
                    if (selectedId === 'one') {
                        option.style.display = 'block';
                    } else {
                        option.style.display = 'none';
                    }

                    this.newCreateCategoryOperation.appendChild(option);

                    this.newCreateTypeOperation.addEventListener('change', (e) => {
                        if (this.newCreateTypeOperation && this.newCreateCategoryOperation && this.newCreateTypeOperation.value === 'expense') {
                            option.style.display = 'none';
                            this.newCreateCategoryOperation.value = ' ';
                        } else {
                            option.style.display = 'block';
                        }
                    })
                    this.newCreateCategoryOperation.addEventListener('change', (e) => {
                        (result as GetCategoryType[]).forEach((item: GetCategoryType) => {
                            if (item.title && this.newCreateCategoryOperation && this.newCreateCategoryOperation.value === item.title) {
                                this.category = item.id;
                                return this.category;
                            }
                        })
                    })
                }

            })

            const resultExpense: GetCategoryType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/expense');

            (resultExpense as GetCategoryType[]).forEach((itemExp: GetCategoryType) => {
                const optionExp: HTMLElement | null = document.createElement('option');
                optionExp.setAttribute('value', itemExp.title);
                optionExp.setAttribute('id', itemExp.id.toString());
                optionExp.className = 'option-element-exp';
                optionExp.innerText = itemExp.title;

                if (this.newCreateTypeOperation && this.newCreateCategoryOperation) {
                    let indexSelected = this.newCreateTypeOperation.selectedIndex,
                        option = this.newCreateTypeOperation.querySelectorAll('option')[indexSelected];

                    let selectedId: string | null = option.getAttribute('id');

                    if (selectedId === 'two') {
                        optionExp.style.display = 'block';
                    } else {
                        optionExp.style.display = 'none';
                    }

                    this.newCreateCategoryOperation.appendChild(optionExp)
                    this.newCreateTypeOperation.addEventListener('change', (e) => {
                        if (this.newCreateTypeOperation && this.newCreateCategoryOperation
                            && this.newCreateTypeOperation.value === 'income') {
                            optionExp.style.display = 'none';
                            this.newCreateCategoryOperation.value = ' ';
                        } else {
                            optionExp.style.display = 'block';
                        }
                    })

                    this.newCreateCategoryOperation.addEventListener('change', (e) => {
                        (resultExpense as GetCategoryType[]).forEach(item => {
                            if (item.title && this.newCreateCategoryOperation && this.newCreateCategoryOperation.value === item.title) {
                                this.category = item.id;
                                return this.category;
                            }
                        })
                    })
                }
            })
        } catch (error) {
            console.log(error);
        }
        this.createNewOperation();
    }

    private createNewOperation(): void {
        const that: Create = this;
        if (this.saveNewCreateOperation) {
            this.saveNewCreateOperation.onclick = async function () {
                const userInfo: UserInfoType | null = Auth.getUserInfo();
                if (!userInfo) {
                    location.href = '#/login';
                }
                if (that.newCreateTypeOperation && that.newCreateAmountOperation
                    && that.newCreateDateOperation && that.newCreateCommentOperation && that.category) {
                    try {
                        const result: PostOperationType | DefaultResponseType = await CustomHttp.request(config.host + '/operations', "POST", {
                            type: that.newCreateTypeOperation.value,
                            category_id: that.category,
                            amount: that.newCreateAmountOperation.value,
                            date: that.newCreateDateOperation.value,
                            comment: that.newCreateCommentOperation.value,
                        });


                        if (result) {
                            that.changeBalance();
                            location.href = '#/operations';
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
    }

    private async changeBalance(): Promise<void> {
        let balance = Number(localStorage.getItem('balance'));
        let amount: number | null;
        if (this.newCreateAmountOperation) {
            amount = Number(this.newCreateAmountOperation.value);
            if (amount && balance) {

                if (this.newCreateTypeOperation) {
                    if (this.newCreateTypeOperation.value === 'income') {
                        this.balanceToChange = balance + amount;
                    }
                    if (this.newCreateTypeOperation.value === 'expense') {
                        this.balanceToChange = balance - amount;
                    }
                }
            }
        }
        JSON.stringify(this.balanceToChange);
        await CustomHttp.request(config.host + '/balance', "PUT", {
            newBalance: this.balanceToChange
        })
    }
}