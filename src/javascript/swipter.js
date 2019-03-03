function Swipter(node){
  this.root = typeof node === 'string' ? document.querySelector('node') : node;
  this.eventHub = {'swipLeft': [], 'swipRight': []};
  this.initX;
  this.newX;
  this.clock;
  this.root.ontouchstart = e=>{
    this.initX = e.changedTouches[0].pageX;
  }
  this.root.ontouchmove = e=>{
    if(this.clock) clearInterval(this.clock)
    this.clock = setTimeout(()=>{
      this.newX = e.changedTouches[0].pageX;
      if( this.newX - this.initX > 10 ){
        this.eventHub['swipRight'].forEach(fn=>fn.bind(this.root)())
      }else if( this.initX - this.newX > 10 ){
        this.eventHub['swipLeft'].forEach(fn=>fn.bind(this.root)())
      }
    }, 100)
  }
  this.on = (type,fn)=>{
    if(this.eventHub[type]){
      this.eventHub[type].push(fn)
    }
  }
}
export default Swipter