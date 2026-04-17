export class IObserver {
    update(event, data) {
        throw new Error('update() must be implemented by subclass');
    }
}
