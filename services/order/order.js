import { PendingState } from './OrderState.js';

export class Order {
    constructor(id) {
        this.id = id;
        this.items = [];
        this.state = new PendingState(this); // Default state
    }

    setState(state) {
        this.state = state;
    }

    nextState() {
        this.state.next();
    }

    getStatus() {
        return this.state.getStatus();
    }
}