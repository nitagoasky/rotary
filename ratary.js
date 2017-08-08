(function(){
    var prizes,
        colors,
        num,
        canvas,
        pointer,
        optsPrize,
        deg = 0,
        rotateDeg;

    var vendors = {
            '': '',
            Webkit: 'webkit',
            Moz: '',
            O: 'o',
            ms: 'ms'
        };

    testEle = document.createElement('p');

    Object.keys(vendors).some(function(vendor) {
        if (testEle.style[vendor + (vendor ? 'T' : 't') + 'ransitionProperty'] !== undefined) {
            cssPrefix = vendor ? '-' + vendor.toLowerCase() + '-' : '';
            eventPrefix = vendors[vendor];
            return true;
        }
    });

    /**
     * [兼容事件前缀]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    function normalizeEvent(name) {
    return eventPrefix ? eventPrefix + name : name.toLowerCase();
    }

    /**
     * [兼容CSS前缀]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    function normalizeCss(name) {
    name = name.toLowerCase();
    return cssPrefix ? cssPrefix + name : name;
    }

    cssSupport = {
        cssPrefix: cssPrefix,
        transform: normalizeCss('Transform'),
        transitionEnd: normalizeEvent('TransitionEnd')
    }

    var whichTransitionEvent = function(){
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
            'transition':'transitionend',
            'OTransition':'oTransitionEnd',
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
        }
        for(t in transitions){
            if( el.style[t] !== undefined ){
                return transitions[t];
            }
        }
    }

    var transform = cssSupport.transform;
    var transitionEnd = cssSupport.transitionEnd;

    var init = function(opts) {
        fnGetPrize = opts.getPrize;
        opts.config(function(data,colors) {
            prizes = opts.prizes = data;
            colors = opts.colors = colors;
            num = prizes.length;
            draw(opts);
        });
        events();
    }

    var $ = function(id) {
        return document.getElementById(id);
    }

    var draw = function(opts) {
        opts = opts || {};

        if(!opts.id || num >>> 0 == 0) return false;

        var id;
        var arc = Math.PI / ( num / 2 );
        id = opts.id;
        rotateDeg = 360 / num / 2 + 90,  // 扇形回转角度
        
        ele = $(id);
        canvas = ele.querySelector('.ratary_canvas');
        pointer = ele.querySelector('.ratary_pointer');

        ctx = canvas.getContext('2d');

        for(var i = 0; i < num; i++) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(180, 180);
            ctx.moveTo(0, 0);
            ctx.rotate((360 / num * i - rotateDeg) * Math.PI / 180);
            ctx.arc(0, 0, 180, 0, 2 * Math.PI / num, false);
            ctx.closePath();
            ctx.fillStyle = opts.colors[i];
            ctx.fill();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = '#f48d24';
            ctx.stroke();
            var startArts = 360 / num ;
            var color = '';
            if(i % 2 == 0){
                color = '#FF0033';
            }else {
                color = '#fff';
            }
            ctx.save();
            ctx.beginPath();
            ctx.translate(Math.cos(arc / 4) * 130, Math.sin(arc / 4) * 130);
            ctx.rotate(arc / 2 + Math.PI / 2);

            if(i % 2 == 0) {
                img = document.getElementById('hb');
            }else{
                img = document.getElementById('thank_you');
            }

            ctx.drawImage(img,0,0);
            ctx.closePath();
            ctx.restore();

            drawCircularText(ctx,prizes[i],rad(10),rad(50),color);

            ctx.restore();
        }
    }

    var drawCircularText = function(ctx, string, startAngle, endAngle, color) {
        var angleDecrement = (startAngle - endAngle)/(string.length-1),
            angle = parseFloat(startAngle),
            index = 0;
        while (index < string.length) {
            character = string.charAt(index);
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.textAlign = 'center';  // 位置
            ctx.font = 'normal normal bold 16px sans-serif';
            ctx.translate(Math.cos(angle) * 150, Math.sin(angle) * 150);
            ctx.rotate(Math.PI/2 + angle);
            ctx.fillText(character, 0, 0);
            angle -= angleDecrement;
            ctx.closePath();
            ctx.restore();
            index++;
        }
    }

    function rad(x){
        return Math.PI*x/180;
    }

    var events = function() {
        bind(pointer,'click',function(){
            fnGetPrize(function(data) {
                optsPrize = {
                  prizeId: data[0],
                  chances: data[1]
                }
                // 计算旋转角度
                deg = deg || 0;
                deg = deg + (360 - deg % 360) + (360 * 10 - optsPrize.prizeId * (360 / num))
                runRotate(deg);
            });
        });
    }

    var runRotate = function(deg) {
        canvas.style[transform] = 'rotate('+ deg +'deg)';
        var transitionEvent = whichTransitionEvent();
        bind(canvas, transitionEvent, stopRotate);
    }

    var bind = function(ele, event, fn) {
        if(typeof addEventListener === 'function') {
            ele.addEventListener(event, fn, false);
        } else if (ele.attachEvent) {
            ele.attachEvent('on' + event, fn);
        }
    }

    var stopRotate = function() {
        // alert('css3运动结束！我是回调函数，没有使用第三方类库！');
        ratary.stopRotate(prizes[optsPrize.prizeId]);
    }

    var ratary = {
        init: function(opts) {
            return init(opts);
        },
        stopRotate: function(){}
    }

    // (@see https://github.com/madrobby/zepto/blob/master/src/zepto.js)
    window.ratary === undefined && (window.ratary = ratary);

    // AMD (@see https://github.com/jashkenas/underscore/blob/master/underscore.js)
    if (typeof define == 'function' && define.amd) {
      define('Ratary', [], function() {
        return ratary;
      });
    }
}())