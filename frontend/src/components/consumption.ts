import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "./balance";
import {GetCategoryType} from "../types/get-category.type";
import {DefaultResponseType} from "../types/default-response.type";
import {UserInfoType} from "../types/userInfo.type";
import {DeletedResponseType} from "../types/deleted-response.type";

export class Consumption {

    constructor() {

        Balance.sending();
        this.init();
    }

    private async init(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/login'
        }

        try {
            const result: Promise<GetCategoryType | DefaultResponseType> = await CustomHttp.request(config.host + '/categories/expense');
            if (result) {
                localStorage.removeItem('BlockName')
                localStorage.removeItem('BlockId')
                this.showConsumptionElements(result)
            }
        } catch (error) {
            console.log(error);
        }
    }

    private showConsumptionElements(result: any): void {
        const incomesCategory: HTMLElement | null = document.getElementById('consumptionItems');

        result.forEach((item: HTMLElement | null) => {
            if (item) {

                const categoryItem: HTMLElement | null = document.createElement('div');
                categoryItem.classList.add('col-sm-4', 'mb-4');

                const categoryCard: HTMLElement | null = document.createElement('div');
                categoryCard.className = 'card';
                categoryItem.setAttribute('id', item.id.toString())

                const categoryCardBody: HTMLElement | null = document.createElement('div');
                categoryCardBody.className = 'card-body';

                const categoryCardName: HTMLElement | null = document.createElement('h2');
                categoryCardName.className = 'card-title';
                categoryCardName.innerText = item.title.toString();

                const editBtnIncome: HTMLElement | null = document.createElement('a');
                editBtnIncome.setAttribute('href', '#/changepay');
                editBtnIncome.className = 'btn btn-primary me-1 change';
                editBtnIncome.innerText = 'Редактировать';

                const deleteBtn: HTMLElement | null = document.createElement('a');
                deleteBtn.setAttribute('href', '#');
                deleteBtn.setAttribute('data-bs-toggle', 'modal');
                deleteBtn.setAttribute('data-bs-target', '#exampleModal');
                deleteBtn.className = 'btn btn-danger deleted';
                deleteBtn.innerText = 'Удалить';

                categoryCardBody.appendChild(categoryCardName);
                categoryCardBody.appendChild(editBtnIncome);
                categoryCardBody.appendChild(deleteBtn);

                categoryCard.appendChild(categoryCardBody);
                categoryItem.appendChild(categoryCard);
                if (incomesCategory) {
                    incomesCategory.appendChild(categoryItem)
                }
            }
        })

        const categoryItemAdd: HTMLElement | null = document.createElement('a');
        categoryItemAdd.className = 'col-sm-4';
        categoryItemAdd.setAttribute('href', '#/addpay');

        const categoryItemAddCard: HTMLElement | null = document.createElement('div');
        categoryItemAddCard.className = 'card';

        const emptyCardBody: HTMLElement | null = document.createElement('div');
        emptyCardBody.className = 'card-body empty';

        const emptyCardBodyAdd: HTMLElement | null = document.createElement('div');
        emptyCardBodyAdd.className = 'add-card'
        emptyCardBodyAdd.innerHTML =
            '<svg width="15" height="15" viewBox="0 0 15 15" fill="none"\n' +
            'xmlns="http://www.w3.org/2000/svg">\n' +
            '<path d="M14.5469 6.08984V9.05664H0.902344V6.08984H14.5469ZM9.32422 0.511719V15.0039H6.13867V0.511719H9.32422Z"\n' +
            'fill="#CED4DA"/>\n' +
            '</svg>'


        emptyCardBody.appendChild(emptyCardBodyAdd);
        categoryItemAddCard.appendChild(emptyCardBody);
        categoryItemAdd.appendChild(categoryItemAddCard);
        if (incomesCategory) {
            incomesCategory.appendChild(categoryItemAdd);
        }


        const editBtnElements: NodeListOf<HTMLElement> | null = document.querySelectorAll('.change')
        editBtnElements.forEach(item => {
            if (item) {
                item.onclick = function () {
                    const result: string | null | undefined = item.previousElementSibling?.textContent;
                    const resultId: string | undefined = item.parentElement?.parentElement?.parentElement?.id

                    localStorage.setItem('BlockName', JSON.stringify(result))
                    localStorage.setItem('BlockId', JSON.stringify(resultId))
                }
            }
        })

        const deleteBtnElement: NodeListOf<HTMLElement> | null = document.querySelectorAll('.deleted');
        const popupDeleteCategory: HTMLElement | null = document.getElementById('btn-delete');
        deleteBtnElement.forEach(item => {
            item.onclick = function () {
                if (item) {
                    if (popupDeleteCategory) {
                        popupDeleteCategory.onclick = async function () {
                            let resultId= item.parentElement?.parentElement?.parentElement?.id
                            try {
                                const result: DeletedResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/categories/expense/' + resultId, "DELETE");
                                if (result) {
                                    location.href = '#/consumption';
                                }
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    }
                }
            }
        })
    }
}