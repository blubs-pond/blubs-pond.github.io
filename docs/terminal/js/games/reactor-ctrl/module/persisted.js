import * as preset from './class.js';

export let setting = {
    sys : {
        globalTimer: new Date.now() * 0.001,
        startTime: new Date.now() * 0.00,
        runTimer: 0
    },
    general : {},
    ui : {},
    sound : {},
    rctrl : {
        difLvl : 1,
        debug : false,
    }
};
