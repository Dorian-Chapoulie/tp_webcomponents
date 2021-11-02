import '../libs/webaudio-controls.js';

const getBaseUrl = () => {
    return window.location.origin + '/components';
}

const template = document.createElement("template");
template.innerHTML = /*html*/`
    <style>
    </style>
    <webaudio-slider
        style="margin-right: 20px;"
        id="freq_60"
        src="${getBaseUrl()}/assets/img/vsliderbody.png"
        knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png"
        value=1
        min=-30
        max=30
        step=0.1
        basewidth=24
        baseheight=128
        knobwidth=24
        knobheight=24
        ditchlength=100
        tooltip="freq 60hz"
    >
    <p id="label_0"></p>
    </webaudio-slider>
    <webaudio-slider
        style="margin-right: 20px;"
        id="freq_170"
        src="${getBaseUrl()}/assets/img/vsliderbody.png"
        knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png"
        value=1
        min=-30
        max=30
        step=0.1
        basewidth=24
        baseheight=128
        knobwidth=24
        knobheight=24
        ditchlength=100
        tooltip="Freq 170hz"
    >
    <p id="label_1"></p>
    </webaudio-slider>
    <webaudio-slider
        style="margin-right: 20px;"
        id="freq_350"
        src="${getBaseUrl()}/assets/img/vsliderbody.png"
        knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png"
        value=1
        min=-30
        max=30
        step=0.1
        basewidth=24
        baseheight=128
        knobwidth=24
        knobheight=24
        ditchlength=100
        tooltip="Freq 350hz"
    >
    <p id="label_2"></p>
    </webaudio-slider>
    <webaudio-slider
        style="margin-right: 20px;"
        id="freq_1000"
        src="${getBaseUrl()}/assets/img/vsliderbody.png"
        knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png"
        value=1
        min=-30
        max=30
        step=0.1
        basewidth=24
        baseheight=128
        knobwidth=24
        knobheight=24
        ditchlength=100
        tooltip="Freq 1000hz"
    >
    <p id="label_3"></p>
    </webaudio-slider>
    <webaudio-slider
        style="margin-right: 20px;"
        id="freq_3500"
        src="${getBaseUrl()}/assets/img/vsliderbody.png"
        knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png"
        value=1
        min=-30
        max=30
        step=0.1
        basewidth=24
        baseheight=128
        knobwidth=24
        knobheight=24
        ditchlength=100
        tooltip="Freq 3500hz"
    >
    <p id="label_4"></p>
    </webaudio-slider>
    <webaudio-slider
        style="margin-right: 20px;"
        id="freq_10000"
        src="${getBaseUrl()}/assets/img/vsliderbody.png"
        knobsrc="${getBaseUrl()}/assets/img/vsliderknob.png"
        value=1
        min=-30
        max=30
        step=0.1
        basewidth=24
        baseheight=128
        knobwidth=24
        knobheight=24
        ditchlength=100
        tooltip="Freq 10 000hz"
    >
    <p id="label_5"></p>
    </webaudio-slider>
`;

class Equalizer extends HTMLElement {
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

                [60, 170, 350, 1000, 3500, 10000].forEach((freq, i) => {
                    const eq = this.audioContext.createBiquadFilter();
                    eq.frequency.value = freq;
                    eq.type = "peaking";
                    eq.gain.value = 0;
                    this.filters.push(eq);
                  });
                
                this.parentSourceNode.connect(this.filters[0]);
                for(var i = 0; i < this.filters.length - 1; i++) {
                   this.filters[i].connect(this.filters[i+1]);
                };

                this.filters[this.filters.length - 1].connect(this.parentAnalyser);

                clearInterval(interval);
            }
        }, 500);
    }

    changeGain(nbFilter, sliderVal) {
        this.filters[nbFilter].gain.value = parseFloat(sliderVal);
        
        const output = this.shadowRoot.getElementById("label_" + nbFilter);
        output.innerHTML = parseFloat(sliderVal).toFixed(2) + " dB";
    }

    createIds() {
        this.ids = {
            FREQ_60: 'freq_60',
            FREQ_170: 'freq_170',
            FREQ_350: 'freq_350',
            FREQ_1000: 'freq_1000',
            FREQ_3500: 'freq_3500',
            FREQ_10000: 'freq_10000',
        };
    }

    getElements() {
        this.freq_60 = this.shadowRoot.getElementById(this.ids.FREQ_60);
        this.freq_170 = this.shadowRoot.getElementById(this.ids.FREQ_170);
        this.freq_350 = this.shadowRoot.getElementById(this.ids.FREQ_350);
        this.freq_1000 = this.shadowRoot.getElementById(this.ids.FREQ_1000);
        this.freq_3500 = this.shadowRoot.getElementById(this.ids.FREQ_3500);
        this.freq_10000 = this.shadowRoot.getElementById(this.ids.FREQ_10000);
    }

    setListeners() {
        this.freq_60.addEventListener('input', ({ target: { value }}) => {
            this.changeGain(0, value);
        });
        this.freq_170.addEventListener('input', ({ target: { value }}) => {
            this.changeGain(1, value);
        });
        this.freq_350.addEventListener('input', ({ target: { value }}) => {
            this.changeGain(2, value);
        });
        this.freq_1000.addEventListener('input', ({ target: { value }}) => {
            this.changeGain(3, value);
        });
        this.freq_3500.addEventListener('input', ({ target: { value }}) => {
            this.changeGain(4, value);
        });
        this.freq_10000.addEventListener('input', ({ target: { value }}) => {
            this.changeGain(5, value);
        });
    }

}

customElements.define("my-equalizer", Equalizer);
