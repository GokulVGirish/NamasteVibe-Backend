class Person {
  value: string;
  next: null | Person;

  constructor(value: string) {
    this.value = value;
    this.next = null;
  }
}
class Queue {
  constructor(
    private head: Person | null = null,
    private tail: Person | null = null
  ) {}
  isEmpty(): boolean {
    return this.head === null;
  }
  enqueue(value: string): void {
    const person = new Person(value);
    if (this.isEmpty()) {
      this.head = person;
      this.tail = person;
    } else {
      if (this.tail) {
        this.tail.next = person;
        this.tail = person;
      }
    }
  }
  dequeue() {
    if (this.isEmpty()) return null;
    const person = this.head!.value;
    this.head = this.head!.next;
    if (this.head === null) {
      this.tail = null;
    }

    return person;
  }
  remove(userId:string){
    if(this.isEmpty())return
     if (this.head && this.head.value === userId) {
       this.head = this.head.next;

       
       if (this.head === null) {
         this.tail = null;
       }
       return;
     }

    let curr=this.head
    while(curr?.next && curr.next.value!==userId){
        curr=curr.next
    }
    if(curr?.next){
        const elementToRemove=curr.next
        curr.next=elementToRemove.next
        if(this.tail===elementToRemove){
            this.tail=curr
        }
    }

  }
  peek(): string | null {
    return this.head ? this.head.value : null;
  }
}
export default Queue;
