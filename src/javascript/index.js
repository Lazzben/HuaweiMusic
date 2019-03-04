import './icons.js';
import Swipter from "./swipter";

function player(node){
  this.$node = typeof node === "string" ? $(node) : node
  this.init(this.$node); 
}

player.prototype = {
  init: function(node){
    this.$player = node
    this.musicList = []
    this.musicIndex = 0
    this.audio = new Audio()
    this.$playPause = this.$player.find('.actions .button-play')
    this.$playNext = this.$player.find('.actions .button-next')
    this.$playPre = this.$player.find('.actions .button-pre')
    this.$panel = this.$player.find('.panel')
    this.$header = this.$player.find('.header')
    this.$lyrics = this.$panel.find('.panel-lyrics .lyrics')
    this.$lyricsPanel = this.$panel.find('.panel-lyrics')
    this.$areaBar = this.$player.find('.footer .area-bar')
    this.$ball = this.$player.find('.header .ball span')
    this.start();
    this.bind();
  },
  bind: function(){
    var _this = this;
    this.$playPause.on('click', function(){
      if(this.classList.contains('play')){
        this.classList.remove('play');
        this.classList.add('pause');
        this.querySelector('use').setAttribute('xlink:href', '#icon-play');
        _this.pauseMusic();
      }else{
        this.classList.remove('pause');
        this.classList.add('play');
        this.querySelector('use').setAttribute('xlink:href', '#icon-pause');
        _this.playMusic();
      }
    })

    this.$playNext.on('click', ()=>{
      this.playNext();
    })

    this.$playPre.on('click', ()=>{
      this.setButtonPlay();
      this.musicIndex--;
      if(this.musicIndex === -1){
        this.musicIndex = this.musicList.length - 1;
      }
      this.audio.src = this.musicList[this.musicIndex].url;
      this.playMusic();
    })

    this.audio.addEventListener('play', ()=>{
      clearInterval(_this.statusClock)
      _this.statusClock = setInterval(function(){
        _this.updateStatus()
      }, 1000)
    })

    this.audio.addEventListener('pause', ()=>{
      clearInterval(_this.statusClock)
    })

    this.audio.addEventListener('ended', ()=>{
      this.playNext();
    })

    this.$areaBar.find('.bar').on('click', (e)=>{
      var percent = e.offsetX / this.$areaBar.find('.bar').width()
      this.audio.currentTime = this.audio.duration * percent
      this.updateStatus(); 
    })

    this.swipter = new Swipter(this.$panel[0])

    this.swipter.on('swipLeft', ()=>{
      this.$panel.addClass('panel2').removeClass('panel1');
      this.$ball.eq(1).addClass('current').siblings().removeClass('current');
    })

    this.swipter.on('swipRight', ()=>{
      this.$panel.addClass('panel1').removeClass('panel2');
      this.$ball.eq(0).addClass('current').siblings().removeClass('current');
    })
  },
  playNext: function(){
    this.setButtonPlay();
    this.musicIndex++;
    if(this.musicIndex === this.musicList.length){
      this.musicIndex = 0;
    }
    this.audio.src = this.musicList[this.musicIndex].url;
    this.playMusic();
  },
  setMusic: function(){
    var music = this.musicList[this.musicIndex]
    this.$header.find('h1').text(music.title);
    this.$header.find('p').text(music.author + `-` + music.albumn)
    this.getLyrics();
    this.audio.onloadedmetadata = () => {
      var duration = this.audio.duration;
      var min = Math.floor(duration / 60);
      var sec = Math.floor(duration % 60);
      sec = sec < 10 ? '0' + sec : sec + '';
      this.$player.find('.time-end').text(min + ':' + sec)
    }
  },
  setLyric: function(){
    var html = '';
    for(var time in this.lyricObj){
      if(this.lyricObj[time] != ''){
        html += '<p time="' + time + '">' + this.lyricObj[time] +'</p>' 
      }
    }
    this.$lyrics.html(html);
    this.$lyrics.css({
      'top': this.$lyricsPanel.height()/2 - parseInt(this.$lyricsPanel.css('line-height')),
      'left': this.$lyricsPanel.width()/2 - this.$lyrics.width()/2
    })
  },
  updateStatus: function(){
    var _this = this
    var currentTime = this.audio.currentTime,
        duration = this.audio.duration;
    var min = Math.floor(currentTime / 60);
    var sec = Math.floor(currentTime % 60);
    sec = sec < 10 ? '0' + sec : sec + '';
    this.$areaBar.find('.time-start').text(min + ':' + sec)
    min = min < 10 ? '0' + min : min + '';
    var time = min + ':' + sec
    this.$areaBar.find('.bar>.progress').css('width', currentTime/duration*100 + '%');
    this.$lyrics.find('p').each(function(index){
      if($(this).attr('time') === time){
        $(this).addClass('current').siblings().removeClass('current')
        if(index!=0){
          _this.$panel.find('.area-affect .lyrics p').eq(0).text(_this.$lyrics.find('p').eq(index - 1).text())
        }
        _this.$panel.find('.area-affect .lyrics p').eq(1).text($(this).text())
        _this.$panel.find('.area-affect .lyrics p').eq(2).text(_this.$lyrics.find('p').eq(index + 1).text())
        _this.$lyrics.css({
          "top": _this.$lyricsPanel.height()/2 - parseInt(_this.$lyricsPanel.css('line-height'))*(index+1)
        })
      }
    })
  },
  playMusic: function(){
    this.audio.play();
    this.setMusic();
  },
  pauseMusic: function(){
    this.audio.pause();
  },
  setButtonPlay: function(){ //解决点击下一曲或上一曲时，还处于暂停状态的bug
    var playPause = this.$playPause[0]
    if(playPause.classList.contains('pause')){
      playPause.classList.remove('pause');
      playPause.classList.add('play');
      playPause.querySelector('use').setAttribute('xlink:href', '#icon-pause');
    }
  },
  start: function(){
    this.ajax('https://Lazzben.github.io/data-mock/huawei-music/music-list.json')
      .then( ret => {
        this.musicList = ret; 
        this.audio.src = this.musicList[this.musicIndex].url;
        this.setMusic();
        console.log(this.audio)
        console.log(this.musicList)
      })
      .catch( ()=> console.log('error',error))
  },
  getLyrics: function(){
    this.ajax(this.musicList[this.musicIndex].lyric)
      .then(ret=>{
        var lyric = ret.lrc.lyric.split('\n'),
            lyricObj = {};
        lyric.forEach(line=>{
          var time = line.match(/\d{2}:\d{2}/g),
              str = line.replace(/\[.+?\]/g, '');
          lyricObj[time] = str;
        })
        this.lyricObj = lyricObj
        this.setLyric();
      })
      .catch(()=>console.log('error', error))
  },
  ajax: function(url){
    var promise = new Promise( (resolve,reject)=>{
    var handler = function(){
      if(this.readyState !== 4){
        return;
      }
      if(this.status === 200){
        resolve(this.response);
      }else{
        reject(new Error(this.statusText));
      }
    };
    var client = new XMLHttpRequest();
    client.open('GET', url, true);
    client.onreadystatechange = handler;
    client.responseType = 'json';
    client.setRequestHeader("Accept", "application/json");
    client.send();
    })
    return promise;
  }
}
var player = new player($('#player'))