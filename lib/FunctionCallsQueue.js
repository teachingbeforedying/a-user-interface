class FunctionCallsQueue {  
    constructor(autorun = true, queue = []) {
      this.running = false;
      this.autorun = autorun;
      this.queue = queue;
    }
  
    add(cb) {
      this.queue.push((value) => {
          const finished = new Promise((resolve, reject) => {
          const callbackResponse = cb(value);
  
          if (callbackResponse !== false) {
              resolve(callbackResponse);
          } else {
              reject(callbackResponse);
          }
        });
  
        finished.then(this.dequeue.bind(this), (() => {}));
      });
  
      if (this.autorun && !this.running) {
          this.dequeue();
      }
  
      return this;
    }

    add_promise(cb_p) {
      this.queue.push((value) => {
        cb_p.then(this.dequeue.bind(this), (() => {}));
      });

      if (this.autorun && !this.running) {
          this.dequeue();
      }

      return this;
    }
  
    dequeue(value) {
      this.running = this.queue.shift();
  
      if (this.running) {
          this.running(value);
      }
  
      return this.running;
    }
  
    get next() {
      return this.dequeue;
    }
  }