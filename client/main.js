// @@ Rig ColorClaw not yet hooked up


var csInterface = new CSInterface();
loadUniversalJSXLibraries();
loadJSX(csInterface.hostEnvironment.appName + '/host.jsx');
window.Event = new Vue();

const EventList = [
  { listenTo: 'debug.on', sendTo: 'debugModeOn', package: false, },
  { listenTo: 'debug.off', sendTo: 'debugModeOff', package: false, },
  { listenTo: 'console', sendTo: 'internalConsole', package: false, },
];

for (let e = 0; e < EventList.length; e++) {
  let event = EventList[e];
  // console.log(event);
  csInterface.addEventListener(event.listenTo, function(evt) {
    // console.log(evt)
    if (/debug/.test(evt.type)) {
      if (evt.type == 'debug.on')
        Event.$emit('debugModeOn');
      if (evt.type == 'debug.off')
        Event.$emit('debugModeOff');
    } else if (/console/.test(evt.type)) {
      console.log(`HOST: ${evt.data}`)
    } else {
      // This might be broken
      // console.log(event);
      if (event.package) {
        // 
      } else {
        // console.log(event)
        Event.$emit(event.sendTo);
      }
    }
  });
}

Vue.component('color-claw', {
  template: `
    <div class="appGrid" 
      @mouseover="wakeApp" 
      @mouseout="sleepApp"
      :style="styleDebug()">
      <event-manager />
      <stylizer />
      <top>
        <toolbar />
      </top>
      <bottom>
        <div class="foot">{{buildNumber}}</div>
      </bottom>
      <panel>
        <center>
          <input-list :model="injectors" />
        </center>
      </panel>
    </div>
  `,
  data() {
    return {
      wakeOnly: false,
      showConsole: true,
      buildNumber: 0,
    }
  },
  computed: {
    debugMode: function () { return this.$root.debugMode },
    isWake: function () { return this.$root.isWake },
    injectors: function () { return this.$root.nodeList },
    // version: function() { return this.$root.buildNumber }
  },
  methods: {
    styleDebug() { return ((this.debugMode) && (this.isWake)) ? `border-color: ${this.$root.getCSS('color-selection')}` : `border-color: transparent`; },
    wakeApp() {
      this.$root.wake();
      this.$root.dispatchEvent('debug.target', this.$root.name);
      if (this.debugMode) {
        this.$root.dispatchEvent('debug.link', 'Can start to read')
      } else {
        // console.log('Not in debug mode')
      }
      // this.checkDebug();
      Event.$emit('startStats');
    },
    sleepApp() {
      if (this.wakeOnly) {
        this.wakeApp();
        Event.$emit('clearStats');
      } else {
        this.$root.sleep();
        if (this.debugMode) {
          // console.log('Attempting to send debug.unlink')
          this.$root.dispatchEvent('debug.target', '');
          this.$root.dispatchEvent('debug.unlink', 'Can no longer read')
        } else {
          // console.log('Not in debug mode')
        }
        Event.$emit('clearStats');
      }
      // this.checkDebug();
    },
    setBuild(msg) {
      console.log(`Setting build to ${msg}`)
      this.buildNumber = msg;
    }
  },
  mounted() {
    console.log(`Version is ${this.version}`);
    Event.$on(`buildNumber`, this.setBuild);
    // Event.$on('showNotification', this.showNotification);
  }
})
Vue.component('panel', { template: `<div class="screen"><slot></slot></div>` })
Vue.component('top', { template: `<div class="appTop"><slot></slot></div>` })
Vue.component('center', { template: `<div class="appMiddle"><slot></slot></div>` })
Vue.component('bottom', { template: `<div class="appBottom"><slot></slot></div>` })

Vue.component('toolbar', {
  template: `
    <div class="appToolbar">
      <intuition />
      <div class="rightHand">
        <app-button label="new coin"/>
        <app-button label="collect all"/>
        <app-button label="scrub all"/>
      </div>
    </div>
  `,
})

Vue.component('intuition', {
  template: `
    <div class="intuition">
      <div :style="getStyle()">{{realhint}}</div>
    </div>
  `,
  data() {
    return {
      whisper: 'stroke',
      realhint: '',
      isOverride: false,
    }
  },
  mounted() {
    Event.$on('overrideIntuition', this.setIntuition);
    Event.$on('resetIntuition', this.resetIntuition);
    Event.$on('recheckIntuition', this.recheckIntuition);
  },
  computed: {
    msg: function() {
      return this.$root.intuition;
    },
    context: function() {
      return this.$root.activeText;
    },
    isClass: function() {
      return (/^\./.test(this.context)) ? true : false;
    },
    isEmpty: function () {
      return (/^$/.test(this.context)) ? true : false;
    },
    isID: function () {
      return (/^\#/.test(this.context)) ? true : false;
    },
    hint: function () {
      if (!this.isOverride) {
        if (this.isClass) {
          return 'class';
        } else if (this.isID) {
          return 'id';
        } else if (this.isEmpty) {
          if (this.isOverride) {
            return this.whisper;
          } else {
            return '';
          }
        } else {
          return 'no selector';
        }
      } else {
        return this.whisper;
      }
    },
  },
  methods: {
    recheckIntuition() {
      this.realhint = this.hint;
    },
    setIntuition(msg) {
      this.$root.intuition = msg;
      // console.log('caught request')
      this.isOverride = true;
      this.whisper = msg;
      this.realhint = msg;
      // console.log(this.realhint);
    },
    resetIntuition() {
      if (this.isOverride)
        this.isOverride = false;
      if (!this.isOverride) {
        // console.log('caught reset request')
        if (!this.isEmpty) {
          // this.realhint = this.hint;
        } else {
          // this.realhint = 'donkey';
        }
      }
    },
    getStyle() {
      // console.log(this.$root.intuition);
      let style = '';
      if (this.isOverride) {
        style += `color: ${this.$root.getCSS('color-text-default')}`;
      } else if (this.isClass) {
        style += `color: ${this.$root.getCSS('color-class')}`;
      } else if (this.isID) {
        style += `color: ${this.$root.getCSS('color-id')}`;
      } else {
        style += `color: ${this.$root.getCSS('color-selection')}`;
      }
      return style;
    }
  }
})

Vue.component('app-button', {
  props: {
    label: String,
  },
  template: `
    <div @click="checkAction" 
      :style="getStyle()" 
      class="button"
      @mouseenter="hasHover"
      @mouseleave="noHover">{{displayText}}</div>
  `,
  data() {
    return {
      isHover: false,
      isActive: false,
      collectors: [],
    }
  },
  computed: {
    displayText: function () {
      return this.label.charAt(0);
    },
    nameCollection: function () {
      // if (this.$root.nodeNames.join(',').match(/\,/).length > 2) {
      //   console.log('Hello?')
      // }
      return this.$root.nodeNames.join(','); 
    },
    genericNames: function () { 
      let str = '';
      for (let i = 0; i < this.$root.nodeColors.length; i++)
        str += `Color ${i + 1},`
      return str;
    },
    colorCollection: function () { 
      // let mirror = [];
      // for (let i = 0; i < this.$root.nodeColors; i++) {
      //   let color = this.$root.nodeColors
      //   mirror.push(color.slice(1))
      // }
      return this.$root.nodeColors.join(',');
    },
  },
  mounted() {
    Event.$on('newCoin', this.newCoin);
    Event.$on('signalCollect', this.highlighter);
    Event.$on('signalCollectOff', this.highlighterOff);
    Event.$on('signalSelect', this.selector);
    Event.$on('signalSelectOff', this.selectorOff);
    Event.$on('altCollect', this.startCollector);
  },
  methods: {
    selector(state) {
      console.log('Selector on')
      Event.$emit('overrideIntuition', `select ${state}`);
    },
    selectorOff() {
      console.log('Selector off')
      Event.$emit('resetIntuition');
    },
    highlighter() {
      if (/collect/i.test(this.label)) {
        this.isHover = true;
        Event.$emit('overrideIntuition', this.label);
      }
    },
    highlighterOff() {
      if (/collect/i.test(this.label)) {
        this.isHover = false;
        Event.$emit('resetIntuition', this.label);
      }
    },
    newCoin() {
      csInterface.evalScript(`init()`, this.getData);
    },
    startCollector() {
      // console.log(this.nameCollection);
      console.log(this.colorCollection);
      console.log('Should target all animations to play')
      Event.$emit(`SlottieAllDrop`);
      this.sendCollector();
    },
    sendCollector() {
      if (this.nameCollection.length > 2) {
        // console.log('not empty');
        csInterface.evalScript(`newCollector('color-claw', '${this.colorCollection}', '${this.nameCollection}')`, this.checkCollector);
      } else {
        csInterface.evalScript(`newCollector('color-claw', '${this.colorCollection}', '${this.genericNames}')`, this.checkCollector);
      }
    },
    checkCollector(response) {
      console.log('Collector was created');
    },
    scrubAll() {
      csInterface.evalScript(`scrubAll()`)
    },
    getData(msg) {
      msg = JSON.parse(msg);
      let mirror = [];
      for (let i = 0; i < msg.colors.length; i++) {
        const arr = msg.colors[i];
        mirror = [].concat(mirror, arr);
      }
      mirror = this.$root.removeDuplicatesInArray(mirror);
      this.createNodeList(mirror);
    },
    createNodeList(mirror) {
      this.$root.nodeList = [], this.$root.nodeNames = [], this.$root.nodeColors = [];
      for (let i = 0; i < mirror.length; i++) {
        const child = {
          color: mirror[i],
          name: '',
          key: i,
        };
        this.$root.nodeList.push(child);
        this.$root.nodeNames.push(`Color ${i + 1}`);
        this.$root.nodeColors.push(mirror[i]);
      }
    },
    hasHover() { 
      this.isHover = true; 
      this.$root.intuition = this.label;
      Event.$emit('overrideIntuition', this.label);
    },
    noHover() {
      this.isHover = false;
      this.$root.intuition = '';
      Event.$emit('resetIntuition');
    },
    getStyle() {
      let style = '';
      if (this.isActive) {
        return style += `border-color: ${this.$root.getCSS('color-selection')};color: ${this.$root.getCSS('color-selection')}`;
      } else if (this.isHover) {
        return style += `border-color: ${this.$root.getCSS('color-icon')};color: ${this.$root.getCSS('color-text-default')}`;
      } else {
        return style += `border-color: ${this.$root.getCSS('color-button-disabled')};color: ${this.$root.getCSS('color-button-disabled')}`;
      }
      // return style;
    },
    checkAction() {
      if (/new\scoin/.test(this.label)) {
        this.newCoin();
      } else if (/collect/.test(this.label)) {
        console.log('Hello?')
        this.startCollector();
      } else if (/scrub/.test(this.label)) {
        this.scrubAll();
      } else {
        console.log('Unrecognized action');
      }
    }
  }
})

Vue.component('input-list', {
  props: {
    model: Array
  },
  template: `
    <div :class="getGridClass()">
      <adobe-input 
        v-for="(input,key) in model"
        :key="key"
        :index="key"
        :model="input"/>
      <div class="placeholder" v-if="hasNone" @click="launch">
        <div class="placeholder-anim">
        </div>
        <div class="placeholder-text">
          INSERT COIN
        </div>
      </div>
    </div>
  `,
  computed: {
    hasNone: function() {
      return (this.$root.nodeList.length < 1) ? true : false;
    }
  },
  methods: {
    launch() {
      Event.$emit('newCoin');
    },
    getGridClass() {
      return 'testGrid';
    },
  },
})



Vue.component('adobe-input', {
  props: {
    index: Number,
    model: Object,
  },
  template: `
    <div class="wrap-input" @mouseenter="hasHover()" @mouseleave="noHover()" :style="getWrapStyle()">
      <div class="label" :style="getLabelStyle()" :title="model.color" @click="ctrlSelect"></div>
      <input 
        :class="getClass()"
        :style="getInputStyle()"
        @keyup="checkInput"
        @keydown="checkHold"
        @focus="hasFocus()"
        @blur="noFocus()"
        v-model="fakeMsg"
        spellcheck="false"
        :placeholder="placeholder"/>
      <div class="extra-btn">
        <lottie v-show="isActive" :width="400" :height="125" :file="build" :index="index" :model="[isActive, isHover]"/>
        <lottie v-show="!isActive" :width="400" :height="125" :file="ghost" :index="index" :model="[isActive, isHover]"/>
      </div>
    </div>
  `,
  data() {
    return {
      build: 'mini7state',
      ghost: 'miniclaw10',
      minWidth: 150,
      fakeMsg: '',
      isActive: false,
      isHover: false,
      placeholder: 'new name',
      isHold: false,
      isControl: false,
      stateList: ['both', 'fill', 'stroke'],
      state: 0,
      currentState: 'both',
    }
  },
  computed: {
    PIN: function () { return this.model.key; },
    RIN: function () { return this.index; },
    color: function () { return this.model.color; },
    name: function () { return this.model.name; },
    isWake: function () { return this.$root.isWake; },
    columnCount: function () {
      return Math.floor(this.$root.panelWidth / this.minWidth);
    },
    columnPercentage: function () {
      return Math.floor(100 / (this.columnCount * 1.05)) + '\%';
    }
  },
  mounted() {
    Event.$on('rebuild', this.rebuild);
    Event.$on('clearFocus', this.noFocus);
    Event.$on('clearHover', this.noHover);
    Event.$on('ensureIntuition', this.checkIntuition);
    Event.$on(`checkSlottie${this.index}Plus`, this.plusState);
    Event.$on(`checkSlottie${this.index}Minus`, this.minusState);
    Event.$on(`checkSlottie${this.index}Active`, this.checkActive);
    Event.$on('SlottieAllDrop', this.forceActive);
    this.rebuild();
    this.checkIntuition();
  },
  methods: {
    checkActive() {
      if (document.activeElement == this.$el.children[1]) {
        this.isActive = true;
        Event.$emit(`Slottie${this.index}boxOn`);
      } else {
        this.noFocus();
      }
    },
    forceActive() {
      this.isActive = true;
      // console.log('Force')
      Event.$emit(`Slottie${this.index}force`, JSON.stringify([1, true]));
      Event.$emit('overrideIntuition', 'collect all');
    },
    ctrlSelect() {
      console.log(`Select ${this.color} of ${this.currentState}`)
      csInterface.evalScript(`selectColor('${this.color}', '${this.currentState}')`);
    },
    plusState() {
      let state = this.getState(1);
      Event.$emit('overrideIntuition', state);
      this.currentState = state;
      Event.$emit(`Slottie${this.index}box${state}`)
    },
    minusState() {
      let state = this.getState(-1);
      Event.$emit(`overrideIntuition`, state);
      this.currentState = state;
      Event.$emit(`Slottie${this.index}box${state}`)
    },
    getState(dir) {
      if (dir > 0) {
        if (this.state < this.stateList.length - 1) {
          this.state = this.state + 1;
        } else {
          this.state = 0;
        }
      } else {
        if (this.state <= 0) {
          this.state = this.stateList.length - 1;
        } else {
          this.state = this.state - 1;
        }
      }
      return this.stateList[this.state];
    },
    checkHold(evt) {
      const self = this;
      if (evt.altKey) {
        if (!this.isHold) {
          this.isHold = true;
          Event.$emit(`Slottie${this.index}boxOn`);
          Event.$emit('signalCollect');
        }
      } else if (evt.ctrlKey|evt.metaKey) {
        if (!this.isControl) {
          this.isControl = true;
          Event.$emit(`Slottie${this.index}boxOn`);
          Event.$emit('signalSelect', this.currentState);
        }
      } else {
        this.isHold = false;
        Event.$emit('signalCollectOff');
      }
    },
    checkIntuition() {
      this.noHover();
      if (this.fakeMsg.length > 0) {
        this.$root.nodeNames[this.index] = this.fakeMsg;
      } else {
        if (/new\sname/.test(this.placeholder)) {
          this.$root.nodeNames[this.index] = `Color ${this.index + 1}`;
        }
      }
      if (/^\./.test(this.$root.activeText)) {
        this.$root.setCSS('color-selection', `${this.$root.getCSS('color-class')}`);
        this.$root.setCSS('color-anim-main', `${this.$root.getCSS('color-class')}`);
      } else if(/^\#/.test(this.$root.activeText)) {
        this.$root.setCSS('color-selection', `${this.$root.getCSS('color-id')}`);
        this.$root.setCSS('color-anim-main', `${this.$root.getCSS('color-id')}`);
      } else if (/^$/.test(this.$root.activeText)) {
        this.$root.setCSS('color-selection', `${this.$root.getCSS('color-native-selection')}`);
        if (this.isActive) {
          this.$root.setCSS('color-anim-main', `${this.$root.getCSS('color-selection')}`);
        } else {
          this.$root.setCSS('color-anim-main', `${this.$root.getCSS('color-native-selection')}`);
        }
        
      } else {
        this.$root.setCSS('color-selection', `${this.$root.getCSS('color-native-selection')}`);
        if (this.isActive) {
          this.$root.setCSS('color-anim-main', `${this.$root.getCSS('color-selection')}`);
        } else {
          this.$root.setCSS('color-anim-main', `${this.$root.getCSS('color-native-selection')}`);
        }
      }
      Event.$emit('recheckIntuition');
      this.$el.children[1].style = this.getInputStyle();
    },
    checkInput(evt) {
      // console.log(evt.key)
      if (/alt/i.test(evt.key)) {
        this.isHold = false;
        Event.$emit('signalCollectOff');
        Event.$emit(`Slottie${this.index}boxOff`);
      } else if (/control/i.test(evt.key)) {
        this.isControl = false;
        console.log('Caught off 1')
        Event.$emit('signalSelectOff');
        Event.$emit(`Slottie${this.index}boxOff`);
      }
      if (!this.isHold) {
        Event.$emit('signalCollectOff');
      }
      if (!this.isControl) {
        // console.log('Caught off 2')
        Event.$emit('signalSelectOff');
      }
      this.$root.activeText = this.fakeMsg;
      if (/enter/i.test(evt.key)) {
        this.submitTest(this.fakeMsg);
      } else if (evt.key.length < 2) {
        this.$root.nodeColors[this.index] = this.color;
        Event.$emit(`Slottie${this.index}`, JSON.stringify([3, true]));
      }
      if (!this.fakeMsg.length) {
        // console.log('empty!')
    
      }
      if (evt.altKey) {
        if (/Arrow(Right|Left)/.test(evt.key)) {
          Event.$emit(`Slottie${this.index}box${evt.key}`);
        }
      }
      this.checkIntuition();
    },
    hasFocus() {
      this.isActive = true;
      this.$root.activeText = this.fakeMsg;
      this.checkIntuition();
      Event.$emit(`Slottie${this.index}`, JSON.stringify([0, true]));
    },
    noFocus() {
      this.isActive = false;
      this.checkIntuition();
      this.$root.activeText = '';
      Event.$emit('clearHover');
      Event.$emit(`Slottie${this.index}`, JSON.stringify([0, false]));
    },
    hasHover() { this.isHover = true; },
    noHover() { this.isHover = false; },
    rebuild() {
      let index = this.index;
      if (this.fakeMsg !== "undefined") {
        if (this.index < this.$root.nodeList.length) {
          this.fakeMsg = this.$root.nodeList[index].name;
        } else {
          // console.log('Caught renegade node');
        }
      } else {
        // console.log('Caught legendary outlaw node');
      }
      // console.log(this.$root.nodeList);
      // console.log(`Rebuilding ${this.index} with ${this.fakeMsg}`);
    },
    getLabelStyle() {
      let style = `background-color: ${this.color};`;
      if (this.isActive) {
        return style += `border-color: ${this.$root.getCSS('color-selection')};`;
      } else if (this.isHover) {
        return style += `border-color: ${this.$root.getCSS('color-icon')};`;
      } else {
        return style += `border-color: ${this.$root.getCSS('color-button-disabled')}`;
      }
      // return style += 
    },
    getClass() { return this.isWake ? 'input-active' : 'input-idle' },
    getWrapStyle() {
      let style = '';
      // if (this.$root.panelWidth > 450) {
      //   style = `width: 30%;`;
      // } else if (this.$root.panelWidth > 300) {
      //   style = `width: 47%;`;
      // } else {
      //   style = `width: 100%;`;
      // }
      style = `width: ${this.columnPercentage}`
      return style;
    },
    getInputStyle() {
      let style = '';
      if (this.$root.panelWidth > 300) {
        style = `width: calc(95% - 3.7rem);`;
      } else {
        style = `width: calc(100% - 3.7rem);`;
      }
      if (this.isActive) {
        return style += `border-color: ${this.$root.getCSS('color-selection')};color: ${this.$root.getCSS('color-selection')}`;
      } else if (this.isHover) {
        return style += `border-color: ${this.$root.getCSS('color-icon')};color: ${this.$root.getCSS('color-text-default')}`;
      } else {
        return style += `border-color: ${this.$root.getCSS('color-button-disabled')};color: ${this.$root.getCSS('color-text-default')}`;
      }
    },
    submitTest(msg) {
      if ((msg.length) && (!this.$root.Alt)) {
        if (this.$root.Shift) {
          // Alternative action
        } else if (this.$root.Ctrl) {
          // console.log('Select?')
          this.ctrlSelect();
        } else {
          Event.$emit(`Slottie${this.index}`, JSON.stringify([1, true]));
          // console.log(`Submitting ${this.index}:${this.fakeMsg};`)
          this.placeholder = this.fakeMsg;
          console.log(`Setting active for ${this.currentState}`);
          csInterface.evalScript(`renameColorParents('${this.color}', '${this.fakeMsg}', '${this.currentState}')`);
          this.fakeMsg = '';
          let index = this.index;
          // Event.$emit('updateMasterNames',[this.placeholder]
          this.$root.nodeNames[index] = this.placeholder;
          // this.$root.activeText = '';
        }
      } else if (this.$root.Alt) {
        Event.$emit('altCollect');
      } else if (this.$root.Ctrl) {
        // Event.$emit('ctrlSelect');
        this.ctrlSelect();
      } else {
        // console.log('Hello!')
        // console.log(`Control is ${this.isControl}`)
        // Event.$emit(`Slottie${this.index}`, JSON.stringify([2, true]));
        Event.$emit(`Slottie${this.index}fail`);
      }
      this.checkIntuition();
      Event.$emit('recheckIntuition');
      Event.$emit('ensureIntuition');
    }
  }
})



Vue.component('lottie', {
  props: {
    model: Array,
    width: Number,
    height: Number,
    index: Number,
    file: String,
    joystick: String,
    event: String,
    layer: String,
    classname: String,
  },
  template: `
    <div :class="classname" :style="getLottieStyle()"></div>
  `,
  data() {
    return {
      speed: 1.75,
      markers: [],
      animData: {},
      animAPI: {},
      aePos: [],
      joyX: 0,
      joyY: 0,
      elt: {},
      project: {},
      isActive: false,
      legacy: false,
      forcing: false,
    }
  },
  mounted() {
    const self = this;
    this.elt = this.$el;
    this.animData = this.buildAnimation();
    this.animData.addEventListener('DOMLoaded', self.registerLottieAPI);
    this.animData.setSpeed(this.speed);
    // Event.$on(`setJoystick${this.joystick}`, this.setJoystick);
    Event.$on(`Slottie${this.index}`, this.playLogic);
    if (this.file == 'miniclaw10') {
      this.legacy = true;
    } else {
      Event.$on(`Slottie${this.index}Bump`, this.playBump);
      Event.$on(`Slottie${this.index}fail`, this.failAnimation);
      Event.$on(`Slottie${this.index}boxOn`, this.newBox);
      Event.$on(`Slottie${this.index}boxOff`, this.destroyBox);
      Event.$on(`Slottie${this.index}boxArrowLeft`, this.slideLeft);
      Event.$on(`Slottie${this.index}boxArrowRight`, this.slideRight);
      Event.$on(`Slottie${this.index}boxboth`, this.boxBoth);
      Event.$on(`Slottie${this.index}boxstroke`, this.boxStroke);
      Event.$on(`Slottie${this.index}boxfill`, this.boxFill);
      Event.$on(`Slottie${this.index}force`, this.playForce);
    }
    this.animData.addEventListener('complete', this.isDone);
  },
  computed: {
    hasJoystick: function () {
      if (!this.legacy)
        return true;
      else
        return false;
      // let state = true;
      // try { state = (this.joystick.length > 2) ? true : false; } catch (e) { state = false } finally { return state; }
    },
    segments: function() {
      let mirrors = [];
      for (let i = 0; i < this.markers.length - 1; i++) {
        const marker = this.markers[i];
        const nextmarker = this.markers[i+1];
        let mirror = {
          forward: [marker, nextmarker],
          reverse: [nextmarker, marker],
        };
        mirrors.push(mirror);
      }
      return mirrors;
    },
  },
  methods: {
    boxStroke() { this.joyX = -200; },
    boxFill() { this.joyX = 200; },
    boxBoth() { this.joyX = 0; },
    newBox() {
      this.forcing = false;
      this.animData.setSpeed(this.speed);
      this.animData.playSegments(this.segments[4].forward, true);
    },
    destroyBox() {
      this.forcing = false;
      this.animData.setSpeed(this.speed);
      this.animData.playSegments(this.segments[4].reverse, true);
    },
    slideLeft() {
      this.forcing = false;
      this.animData.setSpeed(this.speed);
      this.animData.playSegments(this.segments[5].forward);
      Event.$emit(`checkSlottie${this.index}Minus`);
    },
    slideRight() {
      this.forcing = false;
      this.animData.setSpeed(this.speed);
      this.animData.playSegments(this.segments[6].forward);
      Event.$emit(`checkSlottie${this.index}Plus`);
    },
    playForce(msg) {
      msg = JSON.parse(msg)
      let num = msg[0], state = msg[1];
      this.forcing = true;
      this.animData.setSpeed(this.speed);
      this.animData.playSegments(this.segments[num].forward);
      // console.log('Animation forced...')
      // Event.$emit(`checkSlottie${this.index}Active`);
    },
    isDone() {
      // console.log(`${this.index} completed animation.`)
      // console.log(this.animData);
      if (this.forcing) {
        Event.$emit(`checkSlottie${this.index}Active`);
        // console.log(this.animData);
      }
    },
    assignMarkers(args) {
      this.markers = [];
      for (let i = 0; i < args.length; i++) {
        const marker = args[i];
        this.markers.push(marker.tm)
      }
      if (!this.legacy) {
        console.log(this.segments);
      }
    },
    getLottieStyle() {
      let style = `transition: opacity 200ms ${this.$root.getCSS('--quart')} 20ms;`
      if (this.model[0] || this.model[1]) {
        style += 'opacity: 1;'
      } else {
        style += 'opacity: 0.25;'
      }
      return style;
    },
    failAnimation() {
      this.forcing = false;
      if (!this.legacy) {
        this.animData.setSpeed(this.speed);
        this.animData.playSegments(this.segments[2].forward);
      }
    },
    // @@ conflict with miniclaw10 build due to segments not existing
    playLogic(msg) {
      this.forcing = false;
      msg = JSON.parse(msg)    
      let num = msg[0], state = msg[1];
      if (this.segments.length > 0) {
        if ((num < 2) || (!this.legacy))  {
          if (state) {
            this.animData.setSpeed(this.speed);
            this.animData.playSegments(this.segments[num].forward);
          } else {
            this.animData.setSpeed(this.speed * 1.25);
            this.animData.playSegments(this.segments[num].reverse);
          }
        }
      } else {
        console.log(`Segments don't exist yet.`)
      }
    },
    setJoystick(msg) {
      let coords = msg.split(';');
      this.joyX = Number(coords[0]), this.joyY = Number(coords[1]);
    },
    registerLottieAPI() {
      this.assignMarkers(this.animData.animationData.markers);
      if (this.hasJoystick) {
        const self = this;
        this.animAPI = lottie_api.createAnimationApi(this.animData);
        this.aePosition = this.animAPI.getKeyPath(`stateJoy,Transform,Position`);
        this.animAPI.addValueCallback(self.aePosition, function (currentValue) {
          return [self.joyX, self.joyY];
        });
      }
    },
    buildAnimation() {
      const self = this;
      const animData = {
        wrapper: self.elt,
        animType: 'svg',
        loop: false,
        prerender: true,
        autoplay: false,
        path: `./${this.file}.json`,
      };
      return lottie.loadAnimation(animData);
    },
  }
})


Vue.component('event-manager', {
  template: `
    <div 
      v-keydown-outside="onKeyDownOutside"
      v-keyup-outside="onKeyUpOutside"
      v-mousemove-outside="onMouseMove"
      v-mouseup-outside="onMouseUp"
      v-mousedown-outside="onMouseDown"
      v-click-outside="onClickOutside">
    </div>
  `,
  data() {
    return {
      activeList: [
        { name: 'Ctrl' },
        { name: 'Shift' },
        { name: 'Alt' },
      ],
      Shift: false,
      Ctrl: false,
      Alt: false,
      wasDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
    }
  },
  mounted() {
    var self = this;
    this.activeMods();
    this.handleResize(null);
    window.addEventListener('resize', this.handleResize);
    Event.$on('newAction', this.checkDebugAction);
    Event.$on('keypress', this.checkDebugKeypress);
  },
  computed: {
    isDefault: function () { return this.$root.isDefault },
    mouseX: function () { return this.$root.mouseX; },
    mouseY: function () { return this.$root.mouseY; },
    hasCtrl: function () { return this.$root.Ctrl ? 'Ctrl' : false; },
    hasShift: function () { return this.$root.Shift ? 'Shift' : false; },
    hasAlt: function () { return this.$root.Alt ? 'Alt' : false; },
  },
  methods: {
    checkDebugAction(msg) {
      if (this.$root.debugMode) {
        console.log(`Debug action is ${msg}`)
        this.$root.lastAction = msg;
        this.$root.dispatchEvent('debug.listen', JSON.stringify(this.$root.clone));
      }
    },
    checkDebugKeypress(e) {
      if (this.$root.debugMode) {
        console.log(`Debug keypress is ${e.key}`)
        this.getLastKey(e.key);
        this.$root.dispatchEvent('debug.listen', JSON.stringify(this.$root.clone));
      }
    },
    setPanelCSSHeight() {
      this.$root.setCSS('evt-height', `${this.$root.panelHeight - 50}px`);
      this.$root.setCSS('panel-height', `${this.$root.panelHeight - 20}px`);
    },
    handleResize(evt) {
      if (this.$root.activeApp == 'AEFT') {
        this.$root.panelWidth = document.documentElement.clientWidth;
        this.$root.panelHeight = document.documentElement.clientHeight;
      } else {
        this.$root.panelWidth = document.documentElement.clientWidth;
        this.$root.panelHeight = document.documentElement.clientHeight;
        this.setPanelCSSHeight();
        if (this.$root.debugMode) {
          this.$root.dispatchEvent('debug.listen', JSON.stringify(this.$root.clone));
        }
      }
    },
    activeMods() {
      var mirror = [], child = {};
      if (this.Ctrl)
        child = { name: 'Ctrl', key: 0 }, mirror.push(child);
      if (this.Shift) {
        child = { name: 'Shift', key: 1 }
        mirror.push(child);
      }
      if (this.Alt) {
        child = { name: 'Alt', key: 2 }
        mirror.push(child);
      }
      this.activeList = mirror;
    },
    clearMods() {
      this.Shift = false, this.Alt = false, this.Ctrl = false;
      this.activeList = [];
    },
    updateMods() {
      this.Ctrl = this.$root.Ctrl, this.Shift = this.$root.Shift, this.Alt = this.$root.Alt;
      this.activeMods();
    },
    onMouseDown(e, el) {
      this.$root.isDragging = true, this.wasDragging = false;
      this.lastMouseX = this.$root.mouseX, this.lastMouseY = this.$root.mouseY;
      Event.$emit('newAction', 'Mouse click');
    },
    onMouseUp(e, el) {
      if (this.$root.isDragging) {
        if (((this.lastMouseX <= this.$root.mouseX + 6) && (this.lastMouseX >= this.$root.mouseX - 6)) && ((this.lastMouseY <= this.$root.mouseY + 6) && (this.lastMouseY >= this.$root.mouseY - 6))) {
          this.wasDragging = false;
        } else {
          Event.$emit('newAction', 'Click/Drag');
          this.wasDragging = true;
        }
        this.$root.isDragging = false;
      } else {
        // Event.$emit('newAction', 'Drag release');
      }
    },
    onMouseMove(e, el) {
      this.$root.mouseX = e.clientX, this.$root.mouseY = e.clientY;
      if (this.$root.isDragging) {
        Event.$emit('newAction', 'Click-drag')
      } else {
        if (((this.lastMouseX <= this.$root.mouseX + 6) && (this.lastMouseX >= this.$root.mouseX - 6)) && ((this.lastMouseY <= this.$root.mouseY + 6) && (this.lastMouseY >= this.$root.mouseY - 6))) {
          //
        } else {
          Event.$emit('newAction', 'Mouse move');
        }
      }
      this.$root.parseModifiers(e);
      // console.log(`${this.$root.mouseX}, ${this.$root.mouseY}`)
    },
    onClickOutside(e, el) {
      if (!this.wasDragging) {
        Event.$emit('newAction', 'Mouse click');
      }
    },
    onKeyDownOutside(e, el) {
      this.$root.parseModifiers(e);
      this.checkDebugKeypress(e);
      Event.$emit('newAction', 'keyDown');
    },
    onKeyUpOutside(e, el) {
      this.$root.parseModifiers(e);
      this.checkDebugKeypress(e);
      Event.$emit('newAction', 'keyUp');
    },
    getLastKey(msg) {
      if (/Control/.test(msg)) {
        msg = 'Ctrl'
      }
      if (msg !== this.lastKey) {
        if (((this.$root.isDefault) && (msg !== 'Unidentified')) || ((msg == 'Ctrl') || (msg == 'Shift') || (msg == 'Alt'))) {
          if ((msg == 'Ctrl') || (msg == 'Shift') || (msg == 'Alt')) {
            var stack = []
            if (this.hasCtrl)
              stack.push(this.hasCtrl)
            if (this.hasShift)
              stack.push(this.hasShift)
            if (this.hasAlt)
              stack.push(this.hasAlt)

            if (stack.length) {
              console.log('Had length')
              this.lastKey = stack.join('+')
            } else {
              console.log('No length')
              this.lastKey = msg;
            }
          } else {
            this.lastKey = msg;
          }
        } else if (msg == 'Unidentified') {
          this.lastKey = 'Meta'
        } else {
          var stack = []
          if (this.hasCtrl)
            stack.push(this.hasCtrl)
          if (this.hasShift)
            stack.push(this.hasShift)
          if (this.hasAlt)
            stack.push(this.hasAlt)
          stack.push(msg);
          this.lastKey = stack.join('+')
        }
        this.$root.lastKey = this.lastKey;
      }
    },
  },
})


Vue.component('stylizer', {
  template: `
    <div class="stylizer"></div>
  `,
  data() {
    return {
      cssOrder: ['bg', 'icon', 'border', 'button-hover', 'button-active', 'button-disabled', 'text-active', 'text-default', 'text-disabled', 'input-focus', 'input-idle', 'scrollbar', 'scrollbar-thumb', 'scrollbar-thumb-hover', 'scrollbar-thumb-width', 'scrollbar-thumb-radius'],
      activeStyle: [],
      styleList: {
        ILST: {
          lightest: ['#f0f0f0', '#535353', '#dcdcdc', '#f9f9f9', '#bdbdbd', '#e6e6e6', '#484848', '#484848', '#c6c6c6', '#ffffff', '#ffffff', '#fbfbfb', '#dcdcdc', '#a6a6a6', '20px', '20px'],
          light: ['#b8b8b8', '#404040', '#5f5f5f', '#dcdcdc', '#969696', '#b0b0b0', '#101010', '#101010', '#989898', '#e3e3e3', '#e3e3e3', '#c4c4c4', '#a8a8a8', '#7b7b7b', '20px', '10px'],
          dark: ['#535353', '#c2c2c2', '#5f5f5f', '#4a4a4a', '#404040', '#5a5a5a', '#d8d8d8', '#d5d5d5', '#737373', '#ffffff', '#474747', '#4b4b4b', '#606060', '#747474', '20px', '10px'],
          darkest: ['#323232', '#b7b7b7', '#5f5f5f', '#292929', '#1f1f1f', '#393939', '#1b1b1b', '#a1a1a1', '#525252', '#fcfcfc', '#262626', '#2a2a2a', '#383838', '#525252', '20px', '10px'],
        },
      }
    }
  },
  mounted() {
    const self = this;
    csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, self.appThemeChanged);
    this.appThemeChanged();
    Event.$on('findTheme', this.findTheme);
  },
  methods: {
    appThemeChanged(event) {
      var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
      this.findTheme(skinInfo);
    },
    setGradientTheme(appSkin) {
      console.log('After Effects needs stylizer work.');
      this.$root.setCSS('color-bg', toHex(appSkin.panelBackgroundColor.color));
      this.$root.setCSS('color-icon', toHex(appSkin.panelBackgroundColor.color, 30));
      this.$root.setCSS('color-button-disabled', toHex(appSkin.panelBackgroundColor.color, 20));
      this.$root.setCSS('color-scrollbar', toHex(appSkin.panelBackgroundColor.color, -20));
      this.$root.setCSS('color-scrollbar-thumb', toHex(appSkin.panelBackgroundColor.color, 5));
      this.$root.setCSS('color-scrollbar-thumb-hover', toHex(appSkin.panelBackgroundColor.color, 10));
    },
    detectTheme() {
      let app = this.$root.activeApp, theme = this.$root.activeTheme;
    },
    assignTheme() {
      let app = this.$root.activeApp, theme = this.$root.activeTheme;
      console.log('Assigning theme...')
      for (var i = 0; i < this.cssOrder.length; i++) {
        let prop = this.cssOrder[i], value = this.styleList[app][theme][i];
        if (!/width|radius/.test(prop)) {
          this.$root.setCSS(`color-${prop}`, value);
        } else {
          this.$root.setCSS(prop, value);
        }
      }
    },
    getCSSName(str) {
      if (/\_/gm.test(str))
        str = str.replace(/\_/gm, '-');
      return str;
    },
    findTheme(appSkin) {
      console.log(appSkin)
      if (this.$root.activeApp !== 'AEFT') {
        if (appSkin.panelBackgroundColor.color.red > 230)
          this.$root.activeTheme = 'lightest';
        else if (appSkin.panelBackgroundColor.color.red > 170)
          this.$root.activeTheme = 'light';
        else if (appSkin.panelBackgroundColor.color.red > 80)
          this.$root.activeTheme = 'dark';
        else
          this.$root.activeTheme = 'darkest';
        this.assignTheme();
        this.$root.updateStorage();
      } else {
        this.setGradientTheme(appSkin);
      }
    },
  }
})

var app = new Vue({
  el: '#app',
  data: {
    macOS: false,
    buildNumber: 0,
    debugMode: false,
    name: 'none',
    panelWidth: null,
    panelHeight: null,
    mouseX: null,
    mouseY: null,
    lastKey: null,
    lastAction: 'No action',
    isDragging: false,
    winW: null,
    winH: null,
    homepage: 'https://www.inventsable.cc#color-claw',
    activeApp: csInterface.hostEnvironment.appName,
    activeTheme: 'darkest',
    showConsole: true,
    isWake: false,
    Shift: false,
    Ctrl: false,
    Alt: false,
    collection: [],
    intuition: 'start',
    activeText: '',
    nodeNames: [],
    nodeColors: [],
    nodeList: [
      // {
      //   color: '#bc5757',
      //   name: 'Test 1',
      //   key: 0,
      // },
      // {
      //   color: '#57bc57',
      //   name: 'Test 2',
      //   key: 1,
      // },
      // {
      //   color: '#5757bc',
      //   name: '',
      //   key: 2,
      // },
    ],
    context: {
      menu: [
        { id: "refresh", label: "Refresh panel", enabled: true, checkable: false, checked: false, },
        { id: "test", label: "Run test", enabled: true, checkable: false, checked: false, },
        { label: "---" },
        { id: "about", label: "Go to Homepage", enabled: true, checkable: false, checked: false, },
      ],
    },
  },
  computed: {
    menuString: function () { return JSON.stringify(this.context); },
    isDefault: function () {
      var result = true;
      if ((this.Shift) | (this.Ctrl) | (this.Alt))
        result = false;
      return result;
    },
    rootName: function () {
      const str = csInterface.getSystemPath(SystemPath.EXTENSION);
      return str.substring(str.lastIndexOf('/') + 1, str.length);
    },
    clone: function () {
      let self = this;
      let child = {
        name: self.rootName,
        mouseX: self.mouseX,
        mouseY: self.mouseY,
        panelHeight: document.documentElement.clientHeight,
        panelWidth: document.documentElement.clientWidth,
        lastKey: self.lastKey,
        lastAction: self.lastAction,
      }
      return JSON.stringify(child);
    },
    isSmall: function () { return (this.panelWidth < 120) ? true : false; },
    isMedium: function () { return ((this.panelWidth > 120) && (this.panelWidth < 200)) ? true : false; },
    isLarge: function () { return (this.panelWidth > 200) ? true : false; },
  },
  mounted() {
    var self = this;
    this.name = this.rootName;
    if (navigator.platform.indexOf('Win') > -1) { this.macOS = false; } else if (navigator.platform.indexOf('Mac') > -1) { this.macOS = true; }
    this.readStorage();
    this.setContextMenu();
    Event.$on('debugModeOn', this.startDebug);
    Event.$on('debugModeOff', this.stopDebug);
    Event.$on('updateStorage', self.updateStorage);
    // Event.$on(`collect`, this.sendToCollect);
    this.getVersion();
    // this.tryFetch();
    // if (this.notificationsEnabled)
    //   Event.$emit('showNotification');
    // else
    //   Event.$emit('hideNotification');
  },
  methods: {
    getVersion() {
      const path = csInterface.getSystemPath(SystemPath.EXTENSION);
      const xml = window.cep.fs.readFile(`${path}/CSXS/manifest.xml`);
      const verID = /(\w|\<|\s|\=|\"|\.)*ExtensionBundleVersion\=\"(\d|\.)*(?=\")/;
      let match = xml.data.match(verID);
      // console.log(match);
      if (match.length) {
        const str = match[0].split(' ');
        this.buildNumber = str[(str.length - 1)].replace(/\w*\=\"/, '');
        // console.log(this.buildNumber)
        // if (/\d\.\d\.\d/.test(this.buildNumber))
          // console.log('Is original and debug')
        // console.log(str);
      } else {
        this.buildNumber = 'unknown';
      }
      Event.$emit('buildNumber', this.buildNumber);
    },
    startDebug() {
      this.debugMode = true;
      console.log('Received')
      if (this.isWake) {
        console.log('sending clone');
        this.dispatchEvent('debug.listen', JSON.stringify(this.clone));
      }
    },
    stopDebug() { 
      this.debugMode = false; 
      console.log('Stopping debug')
    },
    dispatchEvent(name, data) {
      var event = new CSEvent(name, 'APPLICATION');
      event.data = data;
      csInterface.dispatchEvent(event);
    },
    readStorage() {
      var storage = window.localStorage;
      if (!storage.length) {
        console.log('There was no pre-existing session data');
        this.updateStorage();
      } else {
        console.log('Detected previous session data');
        this.context.menu = JSON.parse(storage.getItem('contextmenu'));
        // this.notificationsEnabled = JSON.parse(storage.getItem('notificationsEnabled'));
        this.rememberContextMenu(storage);
        console.log(storage);
        // console.log(this.notificationsEnabled);
      }
      Event.$emit('rebuildEvents');
    },
    updateStorage() {
      var storage = window.localStorage, self = this;
      storage.setItem('contextmenu', JSON.stringify(self.context.menu));
      // storage.setItem('notificationsEnabled', JSON.stringify(self.notificationsEnabled));
      // this.setContextMenuMemory(storage);
      console.log(storage);
    },
    setContextMenuMemory(storage) {
      for (var i = 0; i < this.context.menu.length; i++) {
        var target = this.context.menu[i], name = target.id;
        if (target.checkable) {
          // console.log(name);
          // console.log(this[name])
          storage.setItem(name, this[name]);
        }
      }
    },
    rememberContextMenu(storage) {
      for (var i = 0; i < this.context.menu.length; i++) {
        var target = this.context.menu[i], name = target.id;
        if (target.checkable) {
          console.log(name)
          this[name] = JSON.parse(storage.getItem(name));
          this.context.menu[i].checked = this[name];
        }
      }
    },
    setContextMenu() {
      var self = this;
      csInterface.setContextMenuByJSON(self.menuString, self.contextMenuClicked);
    },
    contextMenuClicked(id) {
      var target = this.findMenuItemById(id), parent = this.findMenuItemById(id, true);
      if (id == "refresh") {
        location.reload();
      } else if (id == 'about') {
        cep.util.openURLInDefaultBrowser(this.homepage);
      } else if (id == 'test') {
        loadJSX(csInterface.hostEnvironment.appName + '/host.jsx');
      } else {
        this[id] = !this[id];
        var target = this.findMenuItemById(id);
        target.checked = this[id];
      }
      this.updateStorage();
    },
    findMenuItemById(id, requested = false) {
      var child, parent;
      for (var i = 0; i < this.context.menu.length; i++) {
        for (let [key, value] of Object.entries(this.context.menu[i])) {
          if (key == "menu") {
            parent = this.context.menu[i];
            for (var v = 0; v < value.length; v++) {
              for (let [index, data] of Object.entries(value[v])) {
                if ((index == "id") && (data == id))
                  child = value[v];
              }
            }
          }
          if ((key == "id") && (value == id)) {
            child = this.context.menu[i], parent = 'root';
          }
        }
      }
      return (requested) ? parent : child;
    },
    toggleMenuItemSiblings(parent, exclude, state) {
      if (parent.length) {
        for (var i = 0; i < parent.length; i++) {
          if (parent[i].id !== exclude)
            csInterface.updateContextMenuItem(parent[i].id, true, state);
        }
      }
    },
    parseModifiers(evt) {
      var lastMods = [this.Ctrl, this.Shift, this.Alt]
      if (this.isWake) {
        if (((!this.macOS) && (evt.ctrlKey)) || ((this.macOS) && (evt.metaKey))) {
          this.Ctrl = true;
        } else {
          this.Ctrl = false;
        }
        if (evt.shiftKey)
          this.Shift = true;
        else
          this.Shift = false;
        if (evt.altKey) {
          evt.preventDefault();
          this.Alt = true;
        } else {
          this.Alt = false;
        };
        var thisMods = [this.Ctrl, this.Shift, this.Alt]
        // if (!this.isEqualArray(lastMods, thisMods))
        // console.log(`${thisMods} : ${lastMods}`)
        // Event.$emit('updateModsUI');
      } else {
        // Event.$emit('clearMods');
      }
    },
    flushModifiers() {
      this.Ctrl = false;
      this.Shift = false;
      this.Alt = false;
      Event.$emit('clearMods');
    },
    wake() {
      this.isWake = true;
    },
    sleep() {
      this.isWake = false;
      this.flushModifiers();
    },
    getCSS(prop) { return window.getComputedStyle(document.documentElement).getPropertyValue('--' + prop); },
    setCSS(prop, data) { document.documentElement.style.setProperty('--' + prop, data); },
    isEqualArray(array1, array2) {
      array1 = array1.join().split(','), array2 = array2.join().split(',');
      var errors = 0, result;
      for (var i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i])
          errors++;
      }
      if (errors > 0)
        result = false;
      else
        result = true;
      return result;
    },
    removeEmptyValues(keyList, mirror = []) {
      for (var i = 0; i < keyList.length; i++) {
        var targ = keyList[i];
        if ((/\s/.test(targ)) || (targ.length < 6)) {
          // no action
        } else {
          mirror.push(targ);
        }
      }
      return mirror;
    },
    removeDuplicatesInArray(keyList) {
      try {
        var uniq = keyList
          .map((name) => {
            return { count: 1, name: name }
          })
          .reduce((a, b) => {
            a[b.name] = (a[b.name] || 0) + b.count
            return a
          }, {})
        var sorted = Object.keys(uniq).sort((a, b) => uniq[a] < uniq[b])
      } catch (err) {
        sorted = keyList
      } finally {
        return sorted;
      }
    },
  }
});
