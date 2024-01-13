import {UrlManager} from '../utils/url-manager'
import {CustomHttp} from "../services/custom-http";
import Chart from "chart.js/auto";
import config from "../../config/config";
import {Auth} from "../services/auth";
import * as bootstrap from 'bootstrap'
import {Balance} from "./balance";
import {UserInfoType} from "../types/userInfo.type";
import {GetOperationType} from "../types/get-operations.type";
import {DefaultResponseType} from "../types/default-response.type";

export class MainPage {
    private data: null;
    readonly profileElement: HTMLElement | null;
    readonly profileFulNameElement: HTMLElement | null;
    readonly buttonAll: HTMLElement | null;
    readonly buttonWeek: HTMLElement | null;
    readonly buttonMonth: HTMLElement | null;
    readonly buttonYear: HTMLElement | null;
    readonly buttonToday: HTMLElement | null;
    readonly buttonInterval: HTMLElement | null;
    private incomeChart: HTMLCanvasElement | null;
    private expensesChart: HTMLCanvasElement | null;
    private expensesChartView: Chart<"pie"> | null;
    private incomeChartView: Chart<"pie"> | null;
    private buttonIntervalFrom: HTMLInputElement | null;
    private buttonIntervalTo: HTMLInputElement | null;
    // private from: string[];
    // private to: string[];

    constructor() {
        this.data = null;
        this.profileElement = document.getElementById('user');
        this.profileFulNameElement = document.getElementById('user-name');
        this.buttonAll = document.getElementById('btn-check-2-outlined-5')
        this.buttonWeek = document.getElementById('btn-check-2-outlined-2');
        this.buttonMonth = document.getElementById('btn-check-2-outlined-3');
        this.buttonYear = document.getElementById('btn-check-2-outlined-4');
        this.buttonToday = document.getElementById('btn-check-2-outlined-1');
        this.buttonInterval = document.getElementById('btn-check-2-outlined-6');
        this.buttonIntervalFrom = document.getElementById('date-begin') as HTMLInputElement;
        this.buttonIntervalTo = document.getElementById('date-over') as HTMLInputElement;
        this.incomeChart = document.getElementById("pieChart1") as HTMLCanvasElement;
        this.expensesChart = document.getElementById("pieChart2") as HTMLCanvasElement;
        this.expensesChartView = null;
        this.incomeChartView = null;

        UrlManager.getQueryParams();
        (() => {
            const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            tooltipTriggerList.forEach(tooltipTriggerEl => {
                new bootstrap.Tooltip(tooltipTriggerEl)
            })
        })()

        Balance.sending();
        this.init();
        this.showUser();
    }

    private showUser(): void {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            if (this.profileElement && this.profileFulNameElement && userInfo) {
                this.profileElement.style.display = 'flex';
                this.profileFulNameElement.innerText = userInfo.name.toString() + ' ' + userInfo.lastName.toString();
            }
        }
    }

    private buildGraph(result: GetOperationType[]): void {
        let expenseArrAmount: number[] = [];
        let expenseArrCategory: string[] = [];
        let incomeArrAmount: number[] = [];
        let incomeArrCategory: string[] = [];
        result.forEach((item: GetOperationType) => {
            if (item.type === 'expense') {
                expenseArrAmount.push(item.amount)
                expenseArrCategory.push(item.category)
            }
            if (item.type === 'income') {
                incomeArrAmount.push(item.amount)
                incomeArrCategory.push(item.category)
            }
        })

        let incomeChartData = {
            labels: incomeArrCategory,
            datasets: [
                {
                    data: incomeArrAmount,
                    backgroundColor: [
                        "#DC3545",
                        "#FD7E14",
                        "#FFC107",
                        "#20C997",
                        "#0D6EFD",
                        "#FFC0CB",
                        "#00FFFF",
                        "#8B008B"
                    ]
                }]
        };

        if (this.incomeChart) {


            this.incomeChartView = new Chart(this.incomeChart as HTMLCanvasElement, {
                type: 'pie',
                data: incomeChartData
            })
        }


        let expensesChartData = {
            labels: expenseArrCategory,
            datasets: [
                {
                    data: expenseArrAmount,
                    backgroundColor: [
                        "#DC3545",
                        "#FD7E14",
                        "#FFC107",
                        "#20C997",
                        "#0D6EFD",
                        "#FFC0CB",
                        "#00FFFF",
                        "#8B008B"
                    ]
                }]
        };

        if (this.expensesChart) {
            this.expensesChartView = new Chart(this.expensesChart as HTMLCanvasElement, {
                type: 'pie',
                data: expensesChartData
            });
        }
    }

    private async init(): Promise<void> {

        const that: MainPage = this;
        let from: string[];
        let to: string[];
        const userInfo: UserInfoType | null = Auth.getUserInfo();
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


        async function getOperation(period: string): Promise<void> {
            try {
                const result: GetOperationType[] | DefaultResponseType = await CustomHttp.request(config.host + '/operations/?period=' + period);
                if (result) {
                    if (that.expensesChartView != null && that.incomeChartView != null) {
                        that.expensesChartView.destroy();
                        that.incomeChartView.destroy();
                    }
                    that.buildGraph(result as GetOperationType[])
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (this.buttonInterval) {
            this.buttonInterval.onclick = async function () {

                if (that.buttonIntervalFrom && that.buttonIntervalTo) {
                    from = that.buttonIntervalFrom.value.split('.')
                    to = that.buttonIntervalTo.value.split('.')
                }
                try {
                    const result: GetOperationType[] | DefaultResponseType = await CustomHttp.request(config.host + '/operations/?period=interval&dateFrom=' + from + '&dateTo=' + to);
                    if (result) {
                        if (that.expensesChartView != null && that.incomeChartView != null) {
                            that.expensesChartView.destroy();
                            that.incomeChartView.destroy();
                        }
                        that.buildGraph(result as GetOperationType[])
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
}

