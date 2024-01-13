import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "./balance";
import {PostCategoriesType} from "../types/post-categories.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Addmoney {
    private categoryInput: HTMLInputElement | null;
    private sendBtn: HTMLElement | null;

    constructor() {
        this.categoryInput = document.getElementById('categoryName') as HTMLInputElement;
        this.sendBtn = document.getElementById('send');

        Balance.sending();
        this.createdCategoryIncome();
    }

    private createdCategoryIncome(): void {
        const that: Addmoney = this;
        if (this.sendBtn){
            this.sendBtn.onclick = function () {
                if (that.categoryInput){
                    let categoryTitle: string | null = that.categoryInput.value;
                    try {
                        const result: Promise<PostCategoriesType | DefaultResponseType> = CustomHttp.request(config.host + '/categories/income', "POST", {
                            title: categoryTitle
                        });
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }

    }
}