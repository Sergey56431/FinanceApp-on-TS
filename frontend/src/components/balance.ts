import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Balance {
    private balanceCoin: HTMLElement | null;

    constructor() {
        this.balanceCoin = document.getElementById('balance')
    }

    static async sending() {

        let balanceInput: HTMLInputElement | null = document.getElementById('nowBalance') as HTMLInputElement;
        let sendBalance: HTMLElement | null = document.getElementById('sendBalance');
        if (sendBalance) {
            sendBalance.onclick = function () {
                if (balanceInput) {
                    JSON.stringify(balanceInput.value);
                    CustomHttp.request(config.host + '/balance', "PUT", {
                        newBalance: balanceInput.value
                    })
                }
            }
        }
    }

    async myBalance(): Promise<void> {
        let getBalance = await CustomHttp.request(config.host + '/balance')
        if (getBalance) {
            if (this.balanceCoin) {
                this.balanceCoin.innerText = getBalance.balance + "$";
                localStorage.setItem("balance", JSON.stringify(getBalance.balance))
            }
        }
    }
}