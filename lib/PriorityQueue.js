class PriorityQueueElement {

  constructor(payload, priority) {
    this.payload  = payload;
    this.priority = priority;
  }

}

class PriorityQueue {
  /*
    /!\ element with high priority will be treated last
  */
  constructor() {
    this.arr_priority = [];
    this.dict_pqe     = {};
  }



  indexLowestPriority() {
    const index__priority = this.arr_priority.findIndex(elt => elt != null);
    return index__priority;
  }

  lowestPriority() {
    const index__priority = this.indexLowestPriority();
    const priority = this.arr_priority[index__priority];
    return priority;
  }



  enqueue(pqe) {
    const priority = pqe.priority;

    const isPriorityExisting = this.arr_priority.includes(priority);
    if(!isPriorityExisting) {
      const index_insertion = this.arr_priority.reduce((acc,priority_i) => {
        if(priority_i < priority) {
          acc += 1;
        }
        return acc;
      }, 0);

      //insert priority in array
      this.arr_priority.splice(index_insertion, 0, priority);

      //initialize list in dict
      this.dict_pqe[priority] = [];
    }

    //insert pqe in list in dict
    this.dict_pqe[priority].push(pqe);

    return this;
  }

  dequeue() {
    // logger.log("arr_priority", this.arr_priority);
    // logger.log("dict_pqe", this.dict_pqe);

    //find first non-null priority
    const index__priority = this.indexLowestPriority();
    const priority = this.arr_priority[index__priority];
    // logger.log("priority", priority);

    //remove pqe from list in dict
    const pqe_last = this.dict_pqe[priority].pop();
    // logger.log("pqe_last", pqe_last);
    // logger.log("this.dict_pqe[priority]", this.dict_pqe[priority]);

    //clean dict and array if needed
    if(this.dict_pqe[priority].length == 0) {
      delete this.dict_pqe[priority];
      this.arr_priority.splice(index__priority, 1);
    }
    // logger.log("this.arr_priority", this.arr_priority);

    return pqe_last;
  }

  peek() {
    const priority = this.lowestPriority();
    const pqe_last = this.dict_pqe[priority][(this.dict_pqe[priority].length - 1)];
    return pqe_last;
  }

  remove(pqe) {

    const priority = pqe.priority;

    //remove pqe from list in dict
    const index__pqe = this.dict_pqe[priority].findIndex(elt => elt == pqe);
    this.dict_pqe[priority].splice(index__pqe, 1);

    //clean dict and array if needed
    if(this.dict_pqe[priority].length == 0) {
      delete this.dict_pqe[priority];

      const index__priority = this.arr_priority.findIndex(elt => elt == priority);
      this.arr_priority.splice(index__priority, 1);
    }

    return this;
  }




  clear() {
    this.count    = 0;
    this.arr_priority = [];
    this.dict_pqe     = {};
  }

  isEmpty() {
    return (this.arr_priority.length == 0);
  }

}
