export default class KeyBoardWarrior {
    constructor () {

        this.init();
    }

    init = () => {
        this.move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            run: false
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
                    this.move.forward = true;
                    break;
                case 65: // a
                    this.move.left = true;
                    break;
                case 83: // s
                    this.move.backward = true;
                    break;
                case 68: // d
                    this.move.right = true;
                    break;
                case 32: // space
                    this.move.jump = true;
                    break;
                case 16: // shift
                    this.move.run = true;
                    break;
            }
        }

    keyUp(event) 
        {
            switch (event.keyCode) {
                case 87: // w
                    this.move.forward = false;
                    break;
                case 65: // a
                    this.move.left = false;
                    break;
                case 83: // s
                    this.move.backward = false;
                    break;
                case 68: // d
                    this.move.right = false;
                    break;
                case 32: // space
                    this.move.jump = false;
                    break;
                case 16: // shift
                    this.move.run = false;
                    break
            }
        }

}