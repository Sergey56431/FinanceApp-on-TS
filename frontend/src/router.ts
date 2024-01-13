import {Form} from "./components/form";
import {MainPage} from "./components/mainPage";
import {Operations} from "./components/operations";
import {Auth} from "./services/auth";
import {Consumption} from "./components/consumption";
import {Create} from "./components/create";
import {ChangeOperation} from "./components/changeOperation";
import {Addmoney} from "./components/addmoney";
import {Changemoney} from "./components/changemoney";
import {Changepay} from "./components/changepay";
import {Addpay} from "./components/addpay";
import {Income} from "./components/income";
import {RouteTypes} from "./types/routeType";

export class Router {
    private sidebar: HTMLElement | null;
    private layout: HTMLElement | null;
    readonly contentElement: HTMLElement | null;
    private pageSelector: NodeListOf<HTMLAnchorElement>;
    readonly titleElement: HTMLElement | null;
    readonly stylesElement: HTMLElement | null;
    private routs: RouteTypes[];


    constructor() {
        this.layout = document.getElementById('layout');
        this.sidebar = document.getElementById('sidebar');
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('title');
        this.pageSelector = document.querySelectorAll('a[href]');

        this.routs = [
            {
                route: '#/signup',
                title: 'Создайте аккаунт',
                template: 'templates/signup.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                title: 'Вход',
                template: 'templates/login.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/operations',
                title: 'Доходы и Расходы',
                template: 'templates/operations.html',
                styles: 'styles/operations.css',
                load: () => {
                    new Operations();
                }
            },
            {
                route: '#/mainPage',
                title: 'Главная',
                template: 'templates/mainPage.html',
                styles: 'styles/mainPage.css',
                load: () => {
                    new MainPage();
                }
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: 'templates/income.html',
                styles: 'styles/income.css',
                load: () => {
                    new Income();
                }
            },
            {
                route: '#/consumption',
                title: 'Расходы',
                template: 'templates/consumption.html',
                styles: 'styles/income.css',
                load: () => {
                    new Consumption();
                }
            },
            {
                route: '#/create',
                title: 'Создать операцию',
                template: 'templates/create.html',
                styles: 'styles/income.css',
                load: () => {
                    new Create();
                }
            },
            {
                route: '#/change-operation',
                title: 'Редактировать операцию',
                template: 'templates/change-operation.html',
                styles: 'styles/addmoney.css',
                load: () => {
                    new ChangeOperation( );
                }
            },
            {
                route: '#/addmoney',
                title: 'Создать операцию дохода',
                template: 'templates/addmoney.html',
                styles: 'styles/addmoney.css',
                load: () => {
                    new Addmoney()
                }
            },
            {
                route: '#/changemoney',
                title: 'Редактировать доход',
                template: 'templates/changemoney.html',
                styles: 'styles/addmoney.css',
                load: () => {
                    new Changemoney()
                }
            },
            {
                route: '#/changepay',
                title: 'Редактировать расход',
                template: 'templates/changepay.html',
                styles: 'styles/addmoney.css',
                load: () => {
                    new Changepay()
                }
            },
            {
                route: '#/addpay',
                title: 'Создать операцию расход',
                template: 'templates/addpay.html',
                styles: 'styles/addmoney.css',
                load: () => {
                    new Addpay( )
                }
            },
        ]
    }

    public async openRoute():Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            Auth.removeTokens();
            localStorage.removeItem(Auth.userInfoKey);
            localStorage.removeItem('email');
            window.location.href = '#/login';
            return;
        }

        if (urlRoute !== '#/login' && urlRoute !== '#/signup') {
            if (this.sidebar && this.layout){
                this.sidebar.style.display = "block";
                this.layout.style.justifyContent = 'flex-start';
            }
        }

        const newRoute: RouteTypes | undefined = this.routs.find(item => {
            return item.route === urlRoute;
        })

        if (!newRoute) {
            window.location.href = '#/login';
            return;
        }

        for (let i = 0; i < this.pageSelector.length; i++) {
            if (this.pageSelector[i].href.includes(urlRoute) ){
                this.pageSelector[i].classList.add('active');

            }
            if(!this.pageSelector[i].href.includes(urlRoute)){
                this.pageSelector[i].classList.remove('active');
            }
        }

        if (this.contentElement && this.stylesElement && this.titleElement){
            this.contentElement.innerHTML =
                await fetch(newRoute.template).then(response => response.text());
            this.stylesElement.setAttribute('href', newRoute.styles);
            this.titleElement.innerText = newRoute.title;
            newRoute.load();
        }
    }
}