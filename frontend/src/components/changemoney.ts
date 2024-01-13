import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "./balance";
import {UserInfoType} from "../types/userInfo.type";
import {PutCategoriesType} from "../types/put-categories.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Changemoney {
    private categoryInput: HTMLInputElement | null;
    private sendBtn: HTMLElement | null;

    constructor() {
        this.categoryInput = document.getElementById('categoryName') as HTMLInputElement;
        this.sendBtn = document.getElementById('send');

        Balance.sending();
        this.addNameIncome();
        this.newNameIncome();
    }

    private addNameIncome(): void {
        let result: string | null = localStorage.getItem('BlockName');
        if (result) {
            result = result.replace(/[^а-яё]/gi, ' ');
            result = result.replace(/\s+/g, ' ').trim();
            if (this.categoryInput) {
                this.categoryInput.placeholder = result;
            }
        }
    }

    private async newNameIncome(): Promise<void> {
        const that: Changemoney = this;
        let resultId: string | null = localStorage.getItem('BlockId');
        if (resultId) {

            JSON.parse(resultId);
            resultId = resultId.replace(/[^1-9]/gi, ' ');
            resultId = resultId.replace(/\s+/g, ' ').trim();
            resultId = JSON.parse(resultId);
            if (this.sendBtn) {
                this.sendBtn.onclick = function () {
                    const userInfo: UserInfoType | null = Auth.getUserInfo();
                    if (!userInfo) {
                        location.href = '#/login';
                    }
                    if (that.categoryInput) {
                        try {
                            const result: Promise<PutCategoriesType | DefaultResponseType> = CustomHttp.request(config.host + '/categories/income/' + resultId, "PUT", {
                                title: that.categoryInput.value
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            }
        }
    }
}