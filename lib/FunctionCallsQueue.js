class FunctionCallsQueue {  
    constructor(autorun = true, queue = []) {
      this.running = false;
      this.autorun = autorun;
      this.queue = queue;

      this.dict_cancelable = {};
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





    remove(cb__toBeRemoved) {
      var outBool;

      if(this.running == cb__toBeRemoved) {
        //too late to be removed
        outBool = false;
      } else {
        const index = this.queue.indexOf(cb__toBeRemoved);
        if (index > -1) { // only splice array when item is found
          const queue__new = this.queue.splice(index, 1); // 2nd parameter means remove one item only
          this.queue = queue__new;
        }
        outBool = true;
      }

      return outBool;
    }


  }