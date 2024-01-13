import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "./balance";
import {PostCategoriesType} from "../types/post-categories.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Addpay {
    private categoryInput: HTMLInputElement | null;
    private sendBtn: HTMLElement | null;

    constructor() {
        this.categoryInput = document.getElementById('categoryName') as HTMLInputElement;
        this.sendBtn = document.getElementById('send');

        Balance.sending();
        this.createdCategoryConsumption();
    }

    private createdCategoryConsumption(): void {
        const that: Addpay = this;
        if (this.sendBtn){
            this.sendBtn.onclick = function () {
                if (that.categoryInput){
                    let categoryTitle: string | null = that.categoryInput.value;
                    try {
                        const result: Promise<PostCategoriesType | DefaultResponseType> = CustomHttp.request(config.host + '/categories/expense', "POST", {
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