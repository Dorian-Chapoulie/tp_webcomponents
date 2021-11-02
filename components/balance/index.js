import '../libs/webaudio-controls.js';

const getBaseUrl = () => {
    return window.location.origin + '/components';
}

const template = document.createElement("template");
template.innerHTML = /*html*/`
    <style>
    </style>
    <webaudio-knob
        id="balance_L"
        src="${getBaseUrl()}/assets/img/LittlePhatty.png"
        value=0
        min=0
        max=1
        step=0.1
        diameter=64
        tooltip="Balance left %d"
    ></webaudio-knob>
    <webaudio-knob
        id="balance_R"
        src="${getBaseUrl()}/assets/img/LittlePhatty.png"
        value=0
        min=0
        max=1
        step=0.1
        diameter=64
        tooltip="Balance right %d"
    ></webaudio-knob>
`;

class Balance extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.createIds();
        this.filters = [];
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.getElements();
        this.init();
        this.setListeners();
    }

    init() {
        const interval = setInterval(() => {
            if (this.player && this.audioContext && this.parentSourceNode && this.parentAnalyser) {
                this.player.onplay = (e) => { this.audioContext.resume(); }




                clearInterval(interval);
            }
        }, 500);
    }


    createIds() {
        this.ids = {
            BALANCE_L: 'balance_L',
            BALANCE_R: 'balance_R',
        };
    }

    getElements() {
        this.balance_L = this.shadowRoot.getElementById(this.ids.BALANCE_L);
        this.balance_R = this.shadowRoot.getElementById(this.ids.BALANCE_R);
    }

    setListeners() {
       
    }

}

customElements.define("my-balance", Balance);
