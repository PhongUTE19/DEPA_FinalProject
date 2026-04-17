export class IPaymentStrategy {
    async pay(input) {
        throw new Error('pay() must be implemented by subclass');
    }

    getName() {
        throw new Error('getName() must be implemented by subclass');
    }
}
