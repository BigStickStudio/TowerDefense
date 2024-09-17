export default class KeyBoardWarrior {
    constructor () {

        this.init();
    }

    init = () => {
        this.key_pressed = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false
        };

        this.enable();
    }   

    enable = () =>
        {
            document.addEventListener('keydown', (event) => this.keyDown(event), false);
            document.addEventListener('keyup', (event) => this.keyUp(event), false);
        }

    disable = () =>
        {
            document.removeEventListener('keydown', (event) => this.keyDown(event), false);
            document.removeEventListener('keyup', (event) => this.keyUp(event), false);
        }

    keyDown(event) 
        {
            switch (event.keyCode) {
                case 87: // w
                    this.key_pressed.forward = true;
                    break;
                case 65: // a
                    this.key_pressed.left = true;
                    break;
                case 83: // s
                    this.key_pressed.backward = true;
                    break;
                case 68: // d
                    this.key_pressed.right = true;
                    break;
                case 32: // space
                    this.key_pressed.space = true;
                    break;
                case 16: // shift
                    this.key_pressed.shift = true;
                    break;
            }
        }

    keyUp(event) 
        {
            switch (event.keyCode) {
                case 87: // w
                    this.key_pressed.forward = false;
                    break;
                case 65: // a
                    this.key_pressed.left = false;
                    break;
                case 83: // s
                    this.key_pressed.backward = false;
                    break;
                case 68: // d
                    this.key_pressed.right = false;
                    break;
                case 32: // space
                    this.key_pressed.space = false;
                    break;
                case 16: // shift
                    this.key_pressed.shift = false;
                    break
            }
        }

}