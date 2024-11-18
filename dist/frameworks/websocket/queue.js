"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Person {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}
class Queue {
    constructor(head = null, tail = null) {
        this.head = head;
        this.tail = tail;
    }
    isEmpty() {
        return this.head === null;
    }
    enqueue(value) {
        const person = new Person(value);
        if (this.isEmpty()) {
            this.head = person;
            this.tail = person;
        }
        else {
            if (this.tail) {
                this.tail.next = person;
                this.tail = person;
            }
        }
    }
    dequeue() {
        if (this.isEmpty())
            return null;
        const person = this.head.value;
        this.head = this.head.next;
        if (this.head === null) {
            this.tail = null;
        }
        return person;
    }
    remove(userId) {
        if (this.isEmpty())
            return;
        if (this.head && this.head.value === userId) {
            this.head = this.head.next;
            if (this.head === null) {
                this.tail = null;
            }
            return;
        }
        let curr = this.head;
        while (curr?.next && curr.next.value !== userId) {
            curr = curr.next;
        }
        if (curr?.next) {
            const elementToRemove = curr.next;
            curr.next = elementToRemove.next;
            if (this.tail === elementToRemove) {
                this.tail = curr;
            }
        }
    }
    peek() {
        return this.head ? this.head.value : null;
    }
}
exports.default = Queue;
