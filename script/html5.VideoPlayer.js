/**
 * Created by 李豪 on 2015/11/18 0022.
 */
var videoPlayer; //视频对象
var playState;  //播放状态
//获取全屏参数
function requestFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
        // 对 Chrome 特殊处理，
        // 参数 Element.ALLOW_KEYBOARD_INPUT 使全屏状态中可以键盘输入。
        if ( window.navigator.userAgent.toUpperCase().indexOf( 'CHROME' ) >= 0 ) {
            elem.webkitRequestFullScreen( Element.ALLOW_KEYBOARD_INPUT );
        }

        else {
            elem.webkitRequestFullScreen();
        }
    }
    else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    }
}//退出全屏
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
}//全屏按钮操作
function controlFullScreen() {
    var $video_controls = $("#video-controls");
    var $btn_fullScreen = $("#fillScreen");
    var $video = $("#video");
    var elem = $video[0];
    var can_hide = true;
    var time = 0;
    var sid;
    var opy = 1;
    if (document.webkitIsFullScreen) {
        exitFullscreen();
    }
    else {
        requestFullscreen(elem);
    }
    //视频绑定事件
    $video.bind({
        "webkitfullscreenchange": function () {
            if (document.webkitIsFullScreen) {
                $video_controls.css({"top": (window.screen.height - 50) + "px"});
                $btn_fullScreen.removeClass("full-screen");
                $btn_fullScreen.addClass("exit-Screen");
                can_hide = true;
                time = 0;
            }
            else {
                $video_controls[0].removeAttribute("style");
                $btn_fullScreen.removeClass("exit-Screen");
                $btn_fullScreen.addClass("full-screen");
                $video_controls.css({opacity: "1"});
                opy = 1;
                can_hide = false;
                time = 0;
            }
        },
        "mousemove": function () {
            time = 0;
        }
    });
    sid_a = setInterval(function runFullScreen(){
        if(playState == 0)
            time = 0;
        if(time < 110){
                time++;
            if (time < 100 || !can_hide) {
                if (opy < 1) {
                    opy += 0.1;
                    $video_controls.css({opacity: opy + ""});
                }
            }
            else if (time >= 100 && can_hide) {
                if (opy > 0) {
                    opy -= 0.1;
                    $video_controls.css({opacity: opy + ""});
                }
            }

        }
    }, 100);
}

//控制暂停与播放
function playPauseVideo(){
    if(playState != 1){
        videoPlayer.play();
        playState = 1;
    }
    else{
        videoPlayer.pause();
        playState = 2;
    }
    setIconByPlayState(playState);
}
//设置视频BUTTON图标
function setIconByPlayState(state){
//    state=0,视屏停止
//    state=1,视频正在播放
//    state=2,视频暂停
    if(state < 3) {
        var backgroundPosXs = [[-570,-66,-149,-333],[-276,-320,-235,-388],[-570,-66,-149,-388]];
        $("#btn-playOrPause").css({"background-position": backgroundPosXs[state][0]+"px 0px"});
        $("#btn-fastBackward").css({"background-position": backgroundPosXs[state][1]+"px 0px"});
        $("#btn-fastForward").css({"background-position": backgroundPosXs[state][2]+"px 0px"});
        $("#btn-stop").css({"background-position": backgroundPosXs[state][3]+"px 0px"});
    }
}
//设置喇叭图标
function setVolIcon(){
    if(videoPlayer.muted)
        $("#btn-vol").css({"background-position":"-165px 0px"});
    else
        $("#btn-vol").css({"background-position":"-55px 0px"});
}
//设置静音
function muteVideo(){
    videoPlayer.muted = !videoPlayer.muted;
    if(videoPlayer.volume == 0)
        videoPlayer.muted = true;
    setVolIcon();
}
//停止播放
function stopVideo(){
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    playState = 0;
    var $currentTimeDiv = $("#currentTime");
    showCurrentTime($currentTimeDiv);
    var $videoProgress = $("#video-progress");
    var $playedProgress = $("#played-progress");
    var $progressBar = $("#progress-bar");
    playProgress($videoProgress, $playedProgress, $progressBar);
    setIconByPlayState(playState);
}
//快进
function fastForward(){
    var time = videoPlayer.currentTime;
    var step = videoPlayer.duration * 0.01;
    if(step < 3)
        step = 3;
    time += step;
    if(time >= videoPlayer.duration)
        stopVideo();
    else
        videoPlayer.currentTime = time;
}
//快退
function fastBackward(){
    var time = videoPlayer.currentTime;
    var step = videoPlayer.duration * 0.01;
    if(step < 3)
        step = 3;
    time -= step;
    if(time >= 0)
        videoPlayer.currentTime = time;
}
//显示播放到时间
function showCurrentTime($currentTimeDiv){
    var time = getFormTimeString(videoPlayer.currentTime);
    $currentTimeDiv.text(time);
}

//显示总时间
function showDuraion(){
    //视屏刚加载时可能获取时长失败，用间隔不断获取，获取成功就取消此间隔
    var sid = setInterval(function(){
        if(videoPlayer.duration) {
            var time = getFormTimeString(videoPlayer.duration);
            $("#durationTime").text(time);
            clearInterval(sid);
        }
    },100);
}
//缓存进度
function bufferProgress($bufferProgress){
    var bufferTime = 0;
    if(videoPlayer.buffered && videoPlayer.buffered.length){
        bufferTime = videoPlayer.buffered.end(0);
        var percent = Math.round(100 * bufferTime/videoPlayer.duration);
        $bufferProgress.css({"width":percent+"%"});
    }
}
//播放进度
function playProgress($videoProgress, $playedProgress, $progressBar){
    var percent = Math.round(100 * videoPlayer.currentTime/videoPlayer.duration);
    var progress_width = $videoProgress[0].getBoundingClientRect().width;
    var bar_width = $progressBar[0].getBoundingClientRect().width;
    $playedProgress.css({"width":percent+"%"});
    var barLeft = progress_width / 100 * percent - bar_width / 2;
    $progressBar.css({"left": barLeft + "px"});
}
//播放结束
function playEnded(){
    if(videoPlayer.currentTime == videoPlayer.duration)
        stopVideo();
}
//设置进度或音量
function seekBar($progress_bg, $progress, $bar, fn){
    var drag = false;
    var dragX = 0, percent = 0;

    $progress_bg.hover(function(){
            $bar.css({"background-position":"-478px 0px"});
        },function(){
            $bar.css({"background-position":"-442px 0px"});
        }
    );
    $progress_bg.mousedown(function(e){
        if(videoPlayer.duration && !drag) {
            var progress_bg_width = $progress_bg[0].getBoundingClientRect().width;
            var progress_bg_left  = $progress_bg[0].getBoundingClientRect().left;
            var progress_bg_right  = $progress_bg[0].getBoundingClientRect().right;
            var bar_width = $bar[0].getBoundingClientRect().width;
            var pos = e.clientX - progress_bg_left;
            //防止不能得到边界值
            if(pos < 2)
                pos = 0;
            else if(progress_bg_right - pos < 2)
                pos = progress_bg_width;
            var barPosX = parseInt(pos - bar_width / 2);

            if(barPosX >= - parseInt(bar_width / 2) && barPosX <= progress_bg_right - parseInt(bar_width / 2)) {
                $bar.css({"left": barPosX + "px"});
                percent = 100 * pos / progress_bg_width;
                $progress.css({"width": percent + "%"});
                dragX = bar_width / 2;
                drag = true;
                fn(percent, drag);
            }
        }
    });
    $bar.mousedown(function(e){
        dragX = e.clientX - $(this).offset().left;
        drag = true;
    });
    $("#main").bind({
        "mousemove":function(e) {
            if(drag){
                var progress_bg_width = $progress_bg[0].getBoundingClientRect().width;
                var progress_bg_left  = $progress_bg[0].getBoundingClientRect().left;
                var progress_bg_right  = $progress_bg[0].getBoundingClientRect().right;
                var bar_width = $bar[0].getBoundingClientRect().width;
                var border = e.clientX + parseInt(bar_width / 2) - dragX;
                if(border >= progress_bg_left && border <= progress_bg_right){
                    var pos = border - progress_bg_left;
                    //防止不能得到边界值
                    //防止不能得到边界值
                    if(pos < 2)
                        pos = 0;
                    else if(progress_bg_right - pos < 2)
                        pos = progress_bg_width;
                    var barPosX = pos - parseInt(bar_width / 2);
                    var barPosX = parseInt(pos - bar_width / 2);
                    $bar.css({"left": barPosX + "px"});
                    percent = 100 * pos / progress_bg_width;
                    $progress.css({"width": percent + "%"});
                    fn(percent, drag);
                }
            }
        },
        "mouseup":function(e) {
            if(drag) {
                drag = false;
                fn(percent, drag);
            }
        }
    });
}
//获取时间的字符串
function getFormTimeString(time){
    var h_str, m_str, s_str;
    var m = parseInt(time/60);
    var s = parseInt(time)%60;
    h_str = parseInt(time/3600);
    m_str = (m < 10)?"0"+m:""+m;
    s_str = (s < 10)?"0"+s:""+s;
    return h_str+":"+m_str+":"+s_str;
}
//设置音量进度
function setVolumeProgress(){
    var $volume_seek = $("#volume-seek");
    var $volume_progress = $("#volume-progress");
    var $volume_bar = $("#volume-bar");
    var fn_volume = function(percent, drag){
        videoPlayer.volume = percent / 100;
        if(videoPlayer.volume == 0)
            videoPlayer.muted = true;
        else
            videoPlayer.muted = false;
        setVolIcon();
    }
    seekBar($volume_seek, $volume_progress, $volume_bar, fn_volume);
}
function setPlayProgress(){
    var $videoProgress = $("#video-progress");
    var $playedProgress = $("#played-progress");
    var $progressBar = $("#progress-bar");
    var fn_video = function(percent, drag){
        videoPlayer.currentTime = percent / 100 * videoPlayer.duration;
        if(drag)
            videoPlayer.pause();
        else if(playState == 1)
            videoPlayer.play();
    }
    seekBar($videoProgress, $playedProgress, $progressBar, fn_video);
}
//初始化绑定事件处理
function initControl(){

    var btn_playOrPause = $("#btn-playOrPause").hover(function(){
            $(this).css({opacity: "1"});
        },function(){
            $(this).css({"opacity": "0.4"});
        }
    );
    var btn_stop = $("#btn-stop").hover(function(){
            $(this).css({opacity: "1"});
        },function(){
            $(this).css({"opacity": "0.4"});
        }
    );
    var btn_fastBackward = $("#btn-fastBackward").hover(function(){
            $(this).css({opacity: "1"});
        },function(){
            $(this).css({"opacity": "0.4"});
        }
    );
    var btn_fastForward = $("#btn-fastForward").hover(function(){
            $(this).css({opacity: "1"});
        },function(){
            $(this).css({"opacity": "0.4"});
        }
    );
    var btn_vol = $("#btn-vol").hover(function(){
            $(this).css({opacity: "1"});
        },function(){
            $(this).css({"opacity": "0.4"});
        }
    );

    var btn_fillScreen = $("#fillScreen").hover(function(){
            $(this).css({opacity: "1"});
        },function(){
            $(this).css({"opacity": "0.4"});
        }
    );
    btn_playOrPause.click(function(){
        playPauseVideo();
    });
    btn_stop.click(function(){
        if(playState != 0)
            stopVideo();
    });
    var sid;
    btn_fastBackward.bind({
        "mousedown":function() {
            if(playState == 1) {
                fastBackward();
                videoPlayer.pause();
                sid = setInterval(function () {
                    fastBackward();
                }, 100);
            }
        },
        "mouseup":function() {
            if(sid != 0) {
                clearInterval(sid);
                sid = 0;
                if(playState == 1)
                    videoPlayer.play();
            }
        },
        "mouseout":function() {
            if(sid != 0) {
                clearInterval(sid);
                sid = 0;
                if(playState == 1)
                    videoPlayer.play();
            }
        }
     });
    btn_fastForward.bind({
        "mousedown":function() {
            if(playState == 1) {
                fastForward();
                sid = setInterval(function () {
                    fastForward();
                }, 300);
            }
        },
        "mouseup":function() {
            if(sid != 0) {
                clearInterval(sid);
                sid = 0;
            }
        },
        "mouseout":function() {
            if(sid != 0) {
                clearInterval(sid);
                sid = 0;
            }
        }
    });
    btn_vol.click(function(){
        muteVideo();
    });
    btn_fillScreen.click(function(){
        controlFullScreen();
    });

    setVolumeProgress();
    setPlayProgress();
}

function main() {
    videoPlayer = $("#video")[0];
    playState = 0;
    initControl();
    showDuraion();
    var $bufferProgress = $("#buffer-progress");
    var $currentTimeDiv = $("#currentTime");
    var $videoProgress = $("#video-progress");
    var $playedProgress = $("#played-progress");
    var $progressBar = $("#progress-bar");
    setInterval(function () {
        if(playState == 1) {
            playEnded();
            bufferProgress($bufferProgress);
            playProgress($videoProgress, $playedProgress, $progressBar);
            showCurrentTime($currentTimeDiv);
        }
    }, 100);
}
main();
