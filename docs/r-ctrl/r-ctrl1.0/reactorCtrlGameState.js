/**
 * @module gameState
 * @description This module defines the CURRENT game state for the Reactor Control game.
*/

/**
 * @typedef {Object} GameState - Repesent overall game value which is changeable
 * @property {Object} player - Player object
 */

// This is the current game state for the Reactor Control game.
// It is an empty object that can be extended with properties as needed.
let gameState = {
    // Example properties can be added here
    player: {
        hp: 100, // Player's health points
        ap: 10, // Player's Action points
        score: 0, // Player's score
        inv: [], // an array treated as player inventory
        task: [], // a player task array
        caffeen: 0,
        insomnia: 0,
        hunger: 100,
        sanity: 100
    },

    room: {
        CP: {
            task: {

            },
            monster: [],
            isPowered: true,
            isActive: true,
            machine:{
                "water pump": {
                    isWorking: true,
                    isOverclock: false,
                    component: {
                        housing: {
                            hp: 100,
                            isHaunted: false,
                            isShorted: false,
                            upgraded: 0,
                            temp: 25,
                            age: 0
                        },
                        motor: {
                            hp: 1000,
                            isHaunted: false,
                            isShorted: false,
                            upgraded: 0,
                            temp: 30,
                            age: 0
                        }
                    }
                },
                "control pannel": {
                    isWorking: true,
                    component: {
                        pannel: {
                            hp: 100,
                            isHaunted: false,
                            isShorted: false,
                            upgraded: 0,
                            temp: 25,
                            age: 0
                        }      
                    }
                },
                breaker: {
                    isWorking: true,
                    isTriped: false,
                    component: {
                        breaker: {
                            hp: 100,
                            isHaunted: false,
                            isShorted: false,
                            upgraded: 0,
                            temp: 25,
                            age: 0
                        }
                    }
                }
            }
        },
        PC: {

        },
        SF: {

        },
        RR: {

        },
        TR: {

        },
        BW: {

        },
        CA: {

        },
        Elect: {

        },
        SR: {

        },
        CR: {

        },
        GR: {

        },
        LAB: {

        },
        Vent: {

        },
        DCR: {

        },
        BU: {

        },
        A: {

        },
        B: {

        },
        C: {

        },
        D: {

        },
        E: {

        }
    },

    monster: { },


}