import '../libs/webaudio-controls.js';

const getBaseUrl = () => {
    return window.location.origin + '/components';
}

const template = document.createElement("template");
template.innerHTML = /*html*/`
    <style>
    </style>
    <webaudio-knob
        id="balance"
        src="${getBaseUrl()}/assets/img/LittlePhatty.png"
        value=0.5
        min=-1
        max=1
        step=0.1
        diameter=64
        tooltip="Balance"
    >
    <p>Left - Right</p>
    </webaudio-knob>
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
            if (this.audioContext) {
                this.pannerNode = this.audioContext.createStereoPanner();
                this.addAudioNode(this.pannerNode);
                clearInterval(interval);
            }
        }, 500);
    }


    createIds() {
        this.ids = {
            BALANCE: 'balance',
        };
    }

    getElements() {
        this.balance = this.shadowRoot.getElementById(this.ids.BALANCE);
    }

    setListeners() {
        this.balance.addEventListener('input', ({ target: { value }}) => {
            if (this.pannerNode) {
                this.pannerNode.pan.value = parseFloat(value, 10);
            }
        });
    }

}

customElements.define("my-balance", Balance);
