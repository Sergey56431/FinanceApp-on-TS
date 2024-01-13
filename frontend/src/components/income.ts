import config from "../../config/config";
import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import {Balance} from "./balance";
import {DeletedResponseType} from "../types/deleted-response.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Income {

    constructor() {

        Balance.sending();
        this.init();
    }

    private async init(): Promise<void> {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/login'
        }

        try {
            const result = await CustomHttp.request(config.host + '/categories/income');
            if (result) {

                this.showIncomeElements(result)
            }
        } catch (error) {
            console.log(error);
        }
    }

    private showIncomeElements(result: any): void {
        const incomesCategory: HTMLElement | null = document.getElementById('cardPlace');

        result.forEach((item: any) => {
            const categoryItem: HTMLElement | null = document.createElement('div');
            categoryItem.classList.add('col-sm-4', 'mb-4');

            const categoryCard: HTMLElement | null = document.createElement('div');
            categoryCard.className = 'card';
            categoryItem.setAttribute('id', item.id)

            const categoryCardBody: HTMLElement | null = document.createElement('div');
            categoryCardBody.className = 'card-body';

            const categoryCardName: HTMLElement | null = document.createElement('h2');
            categoryCardName.className = 'card-title';
            categoryCardName.innerText = item.title;

            const editBtnIncome: HTMLElement | null = document.createElement('a');
            editBtnIncome.setAttribute('href', '#/changemoney');
            editBtnIncome.className = 'btn btn-primary me-1 change';
            editBtnIncome.innerText = 'Редактировать';

            const deleteBtn: HTMLElement | null = document.createElement('a');
            deleteBtn.setAttribute('href', '#')
            deleteBtn.setAttribute('data-bs-toggle', 'modal')
            deleteBtn.setAttribute('data-bs-target', '#exampleModal')
            deleteBtn.className = 'btn btn-danger deleted';
            deleteBtn.innerText = 'Удалить';

            categoryCardBody.appendChild(categoryCardName);
            categoryCardBody.appendChild(editBtnIncome);
            categoryCardBody.appendChild(deleteBtn);

            categoryCard.appendChild(categoryCardBody)
            categoryItem.appendChild(categoryCard)
            if (incomesCategory) {
                incomesCategory.appendChild(categoryItem)
            }
        })

        const categoryItemAdd: HTMLElement | null = document.createElement('a');
        categoryItemAdd.className = 'col-sm-4';
        categoryItemAdd.setAttribute('href', '#/addmoney');

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
            item.onclick = function () {
                if (item){
                    const result = item.previousElementSibling?.textContent
                    const resultId = item.parentElement?.parentElement?.parentElement?.id
                    localStorage.setItem('BlockName', JSON.stringify(result))
                    localStorage.setItem('BlockId', JSON.stringify(resultId))
                }
            }
        })

        const deleteBtnElement: NodeListOf<HTMLElement> | null = document.querySelectorAll('.deleted');
        const popupDeleteCategory: HTMLElement | null = document.getElementById('btn-delete');
        deleteBtnElement.forEach(item => {
            if (item) {
                item.onclick = function () {
                    if (popupDeleteCategory) {
                        popupDeleteCategory.onclick = async function () {
                            let resultId = item.parentElement?.parentElement?.parentElement?.id
                            try {
                                const result: DeletedResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income/' + resultId, "DELETE");
                                if (result) {
                                    location.href = '#/income';
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