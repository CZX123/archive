var $html = document.getElementsByTagName('html')[0],
	$nav = document.getElementsByTagName('nav')[0],
	$menu = document.getElementsByClassName('menu')[0],
	$ghost = document.getElementsByClassName('ghost')[0],
	$navdrawer = document.getElementsByClassName('nav-drawer')[0],
	$scrim = document.getElementsByClassName('scrim')[0],
	$fab = document.getElementsByClassName('fab')[0];

setTimeout(function() {
	$nav.classList.remove('animate');
}, 500);
setTimeout(function() {
	$menu.classList.remove('animate');
}, 1100);
setTimeout(function() {
	$fab.classList.remove('animate');
}, 1500);

var timer3;
$menu.addEventListener('click', function(e) {
	e.preventDefault();
	$navdrawer.classList.add('active');
	$html.style.overflow = 'hidden';
	timer3 = setTimeout(function() {
		dragBack();
		timer3 = 0;
	}, 300);
});
$scrim.addEventListener('click', function() {
	$navdrawer.classList.remove('active');
	$html.style.overflow = '';
	if (timer3) clearTimeout(timer3);
	removeDragBack();
});
var navheight, $navlogo = document.getElementsByTagName('header')[0], $footer = document.getElementsByTagName('footer')[0], footerawidth = $footer.children[0].offsetWidth + $footer.children[1].offsetWidth;
function navHeight() {
	if (window.matchMedia('(max-height:450px)').matches) navheight = 48;
	else if (window.matchMedia('(max-width:767px)').matches) navheight = 56;
	else navheight = 64;
	if (window.matchMedia('(max-width:356px)').matches) logoWidth();
	else $navlogo.removeAttribute('style');
	compressFooter();
}
navHeight();
window.addEventListener('resize', navHeight);

logoWidth();
function logoWidth() {
	var w = $navdrawer.getBoundingClientRect().width;
	$navlogo.style.transform = 'translate(-50%,-50%) scale(' + (0.0028*w - 0.14) + ')';
}

compressFooter();
function compressFooter() {
	if (window.matchMedia('(max-width:' + footerawidth + 'px)').matches) $footer.classList.add('compress');
	else $footer.classList.remove('compress');
}

var $navh1 = document.querySelector('nav h1'), $navimg = document.querySelector('nav .bg-image'), wf;
if ($nav.classList.contains('waterfall')) {
	wf = true;
	window.addEventListener('scroll', nav);
	window.addEventListener('resize', nav);
	if ($menu.classList.contains('dark-bg') && window.pageYOffset < 256 - navheight) $menu.classList.add('dark-bg-true');
}
else {
	window.addEventListener('scroll', direction);
}
function nav() {
	var y = window.pageYOffset;
	if (y < 256 - navheight) {
		$nav.classList.add('waterfall');
		$menu.style.transform = '';
		$menu.style.transition = 'background .2s cubic-bezier(.4,0,.2,1)';
		if ($menu.classList.contains('dark-bg')) $menu.classList.add('dark-bg-true');
		$navimg.style.transform = 'translate3d(0,' + (y/2) + 'px,0)';
		$navimg.style.opacity = y/(navheight - 256) + 1;
		if (window.matchMedia('(max-width:450px)').matches) {
			$navh1.style.bottom = 36 + (navheight/2 - 60)*y/(256 - navheight) + 'px';
			$navh1.style.fontSize = 44 - 24*y/(256 - navheight) + 'px';
		}
		else {
			$navh1.style.bottom = 80 + (navheight/2 - 104)*y/(256 - navheight) + 'px';
			$navh1.style.fontSize = 56 - 36*y/(256 - navheight) + 'px';
		}
	}
	else if (y >= 256 - navheight && y < 256) {
		$nav.style.transition = '';
		if ($nav.classList.contains('waterfall')) {
			if ($menu.classList.contains('dark-bg-true')) $menu.classList.remove('dark-bg-true');
			if (window.getComputedStyle($ghost).getPropertyValue('opacity') == '0') {
				$menu.removeAttribute('style');
				$nav.classList.remove('waterfall');
			}
			else {
				$menu.style.transform = 'translate3d(0,' + (256 - navheight - y) + 'px,0)';
				$menu.style.transition = 'background .2s cubic-bezier(.4,0,.2,1)';
			}
		}
		$navimg.style.opacity = 0;
		$navh1.style.bottom = navheight/2 - 24 + 'px';
		$navh1.style.fontSize = '20px';
	}
	else {
		$nav.style.transition = '';
		$navimg.style.opacity = 0;
		$navh1.style.bottom = navheight/2 - 24 + 'px';
		$navh1.style.fontSize = '20px';
		$menu.removeAttribute('style');
		if ($nav.classList.contains('waterfall')) {
			$nav.style.display = 'none';
			$nav.classList.remove('waterfall');
			setTimeout(function() {$nav.style.display = '';}, 2);
		}
	}
	direction();
	removeAnimate();
}
var previous = window.pageYOffset;
function direction() {
	var y = window.pageYOffset;
	if (wf && y < 256 - navheight && y < previous) $nav.style.transition = 'box-shadow .3s cubic-bezier(.4,0,.2,1)';
	if (wf && y < 256 && previous < 256) return false;
	if (y > previous) {
		if (window.getComputedStyle($ghost).getPropertyValue('opacity') != '0') {
			$nav.classList.add('hide');
			$menu.classList.add('hide');
		}
	}
	if (y < previous) {
		$nav.classList.remove('hide');
		$menu.classList.remove('hide');
	}
	previous = y;
	backToTop();
	removeAnimate();
}
$ghost.addEventListener('mouseenter', function() {
	$nav.classList.remove('hide');
	$menu.classList.remove('hide');
});

var $scrollanimate = document.getElementsByClassName('scroll-animate'), s;
function removeAnimate() {
	for (s = 0; s < $scrollanimate.length; s++) {
		if ($scrollanimate[s].getBoundingClientRect().top < window.innerHeight) {
			$scrollanimate[s].classList.remove('scroll-animate');
			s -= 1;
		}
	}
}
setTimeout(removeAnimate, 800);

var $sections = document.getElementsByTagName('section'), scrolling;
function getOrder() {
	if (scrolling) return false;
	var startingY = window.pageYOffset, i = 0;
	while (i < $sections.length) {
		if (startingY >= $sections[i].offsetTop - 20) {
			i++;
			if (i == $sections.length || startingY >= document.body.offsetHeight - window.innerHeight - 20) {
				if (i == $sections.length && startingY < document.body.offsetHeight - window.innerHeight - 20) doScrolling(-2, 700);
				else doScrolling(-1, 1200);
				break;
			}
		}
		else {
			doScrolling(i, 800);
			break;
		}
	}
}
function doScrolling(order, duration) {
	var startingY = window.pageYOffset, start, easing = function (t) { return 1-(--t)*t*t*t; }, diff;
	if (order == 0) {
		duration = 600;
		diff = $sections[order].offsetTop - startingY;
	}
	else if (order != -1) {
		check: {
			diff = document.body.offsetHeight - window.innerHeight - startingY;
			if (order == -2) break check;
			if ($sections[order].offsetTop <= document.body.offsetHeight - window.innerHeight) diff = $sections[order].offsetTop - startingY;
		}
	}
	else {
		diff = -startingY;
	}
	window.requestAnimationFrame(function step(timestamp) {
		if (!start) start = timestamp;
		if (!scrolling) scrolling = true;
		var time = timestamp - start,
			percent = Math.min(time / duration, 1);
		percent = easing(percent);
		window.scrollTo(0, startingY + diff * percent);
		if (time < duration) {
			window.requestAnimationFrame(step);
		}
		else {
			scrolling = false;
		}
	});
}
function backToTop() {
	var y = window.pageYOffset;
	if (y >= document.body.offsetHeight - window.innerHeight - 20) {
		$fab.classList.add('back-to-top');
	}
	else {
		$fab.classList.remove('back-to-top');
	}
}
$fab.addEventListener('mouseenter', function() {
	$html.style.willChange = 'scroll-position';
});
$fab.addEventListener('mouseleave', function() {
	$html.style.willChange = '';
});
$fab.addEventListener('click', getOrder);

var supportsPassive = false;
document.createElement("div").addEventListener("test", function() {}, {
	get passive() {
		supportsPassive = true;
		return false;
	}
});


var $drag = document.getElementsByClassName('drag-nav-drawer')[0], $size = $navdrawer.getBoundingClientRect(), past, current, diff, back;
var touch_capable = 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch || navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0;
if (!touch_capable) {
	$drag.style.zIndex = '5';
}
if (supportsPassive) {
	$drag.addEventListener('touchstart', startDrag, {passive: true});
	$drag.addEventListener('touchmove', mainDrag, {passive: true});
	$drag.addEventListener('touchend', endDrag, {passive: true});
	$drag.addEventListener('touchcancel', cancelDrag, {passive: true});
}
else {
	$drag.addEventListener('touchstart', startDrag);
	$drag.addEventListener('touchmove', mainDrag);
	$drag.addEventListener('touchend', endDrag);
	$drag.addEventListener('touchcancel', cancelDrag);
}

function dragBack() {
	if (supportsPassive) {
		document.addEventListener('touchstart', startBack, {passive: true});
		document.addEventListener('touchmove', mainBack, {passive: true});
		document.addEventListener('touchend', endBack, {passive: true});
		document.addEventListener('touchcancel', cancelBack, {passive: true});
	}
	else {
		document.addEventListener('touchstart', startBack);
		document.addEventListener('touchmove', mainBack);
		document.addEventListener('touchend', endBack);
		document.addEventListener('touchcancel', cancelBack);
	}
}
function removeDragBack() {
	document.removeEventListener('touchstart', startBack);
	document.removeEventListener('touchmove', mainBack);
	document.removeEventListener('touchend', endBack);
	document.removeEventListener('touchcancel', cancelBack);
}

function startDrag(e) {
	past = e.touches[0].clientX;
	$html.style.overflow = 'hidden';
	$navdrawer.classList.add('dragging');
	$navdrawer.style.transitionDuration = '.1s';
	$navdrawer.style.transform = 'translateX(-' + ($size.width - past) + 'px)';
	$navdrawer.classList.add('active');
}
function mainDrag(e) {
	current = e.changedTouches[0].clientX;
	$navdrawer.style.transitionDuration = '0s';
	$navdrawer.style.transform = 'translateX(-' + ($size.width - current) + 'px)';
	if (current >= $size.width) {
		$navdrawer.style.transform = 'translateX(0)';
	}
	diff = current - past;
	past = current;
}
function endDrag(e) {
	$navdrawer.classList.remove('dragging');
	$navdrawer.removeAttribute('style');
	if (current < $size.width/2) {
		if (diff < 14) {
			$html.removeAttribute('style');
			$navdrawer.classList.remove('active');
		}
		else dragBack();
	}
	else dragBack();
}
function cancelDrag() {
	$navdrawer.removeAttribute('style');
	$html.removeAttribute('style');
	$navdrawer.classList.remove('active');
}
function startBack(e) {
	if (!$navdrawer.classList.contains('active')) {
		removeDragBack();
		return false;
	}
	back = e.touches[0].clientX;
	past = back;
}
function mainBack(e) {
	current = e.changedTouches[0].clientX;
	$navdrawer.style.transitionDuration = '0s';
	$navdrawer.style.transform = 'translateX(-' + (back - current) + 'px)';
	if (current > back) $navdrawer.style.transform = 'translateX(0)';
	diff = current - past;
	past = current;
}
function endBack(e) {
	$navdrawer.removeAttribute('style');
	if (current < back - $size.width/2 || diff < -14) {
		$html.removeAttribute('style');
		$navdrawer.classList.remove('active');
		removeDragBack();
	}
}
function cancelBack() {
	$navdrawer.removeAttribute('style');
}

// Ripple effect

var $ripple = Array.prototype.slice.call(document.querySelectorAll('.nav-drawer ul li a, button, footer > a')), n;

document.addEventListener("DOMContentLoaded", function() {
	var attach;
	for (n = 0; n < $ripple.length; n++) {
		attach = $ripple[n].parentElement;
		if ($ripple[n].tagName == 'BUTTON') attach = $ripple[n].children[0];
		if ($ripple[n].parentElement.tagName == 'FOOTER') attach = $ripple[n];
		if (!attach.children[attach.children.length - 1] || attach.children[attach.children.length - 1].className != 'ripple') {
			var $div = document.createElement('DIV');
			$div.className = 'ripple';
			attach.appendChild($div);
		}
	}
});

var i, flag = false, timer, destination, target, x, y, timer2, X, Y;

for (i = 0; i < $ripple.length; i++) {
	$ripple[i].addEventListener('mousedown', pressed);
	$ripple[i].addEventListener('mouseup', released);
	if (supportsPassive) {
		$ripple[i].addEventListener('touchstart', pressed, {passive: true});
		$ripple[i].addEventListener('touchmove', moved, {passive: true});
	}
	else {
		$ripple[i].addEventListener('touchstart', pressed);
		$ripple[i].addEventListener('touchmove', moved);
	}
	$ripple[i].addEventListener('touchend', released);
	$ripple[i].addEventListener('touchcancel', released);
}
function pressed(e) {
	destination = this.parentElement.lastElementChild;
	if (this.tagName == 'BUTTON') destination = this.children[0].lastElementChild;
	if (this.parentElement.tagName == 'FOOTER') destination = this.lastElementChild;
	if (timer2) {
		clearTimeout(timer2);
		timer2 = 0;
		destination.classList.remove('appear');
	}
	destination.classList.remove('fade-out', 'finish');
	if (e.touches) {
		if (timer) clearTimeout(timer);
		timer = 0;
		flag = true;
		this.removeEventListener('mouseleave', released);
		var n = e.touches.length - 1;
		X = e.touches[n].clientX;
		Y = e.touches[n].clientY;
		if (this.tagName == 'BUTTON') {
			x = X - this.getBoundingClientRect().left - this.children[0].offsetLeft - 28;
			y = Y - this.getBoundingClientRect().top - this.children[0].offsetTop - 28;
			if (this.classList.contains('fab')) {
				x = X - this.offsetLeft - this.children[0].offsetLeft;
				y = Y - this.offsetTop - this.children[0].offsetTop - 28;
			}
		}
		else {
			x = X - this.getBoundingClientRect().left - 28;
			y = (this.parentElement.tagName == 'FOOTER') ? Y - this.parentElement.getBoundingClientRect().top + 64 : Y - this.parentElement.getBoundingClientRect().top - 28;
		}
	}
	else {
		if (!flag) {
			this.addEventListener('mouseleave', released);
			X = e.clientX;
			Y = e.clientY;
			if (this.tagName == 'BUTTON') {
				x = X - this.getBoundingClientRect().left - this.children[0].offsetLeft - 28;
				y = Y - this.getBoundingClientRect().top - this.children[0].offsetTop - 28;
				if (this.classList.contains('fab')) {
					x = X - this.offsetLeft - this.children[0].offsetLeft;
					y = Y - this.offsetTop - this.children[0].offsetTop - 28;
				}
			}
			else {
				x = X - this.getBoundingClientRect().left - 28;
				y = Y - this.parentElement.getBoundingClientRect().top - 28;
				y = (this.parentElement.tagName == 'FOOTER') ? Y - this.parentElement.getBoundingClientRect().top + 64 : Y - this.parentElement.getBoundingClientRect().top - 28;
			}
		}
	}
	destination.style.top = y + 'px';
	destination.style.left = x + 'px';
	destination.classList.add('appear');
	timer2 = setTimeout(function() {
		destination.classList.add('finish');
		if (destination.classList.contains('fade-out')) destination.classList.remove('appear');
		timer2 = 0;
	}, 300);
}
function released(e) {
	target = this.parentElement.lastElementChild;
	if (this.tagName == 'BUTTON') target = this.children[0].lastElementChild;
	if (this.parentElement.tagName == 'FOOTER') target = this.lastElementChild;
	if (e.touches) {
		if (e.type != 'touchcancel') {
			e.preventDefault();
			var lasttouch = e.changedTouches[e.changedTouches.length - 1];
			if (lasttouch.clientX > X - 4 && lasttouch.clientX < X + 4 && lasttouch.clientY > Y - 4 && lasttouch.clientY < Y + 4) {
				this.click();
			}
		}
		timer = setTimeout(function() {
			flag = false;
			timer = 0;
		}, 500);
		target.classList.add('fade-out');
		if (!timer2) target.classList.remove('appear');
	}
	else {
		if (!flag) {
			this.removeEventListener('mouseleave', released);
			target.classList.add('fade-out');
			if (!timer2) target.classList.remove('appear');
		}
	}
}
function moved(e) {
	var touch = e.changedTouches[e.changedTouches.length - 1];
	if (this.tagName != "A" || this.parentElement.tagName == "FOOTER") {
		target = this.children[0].lastElementChild;
		if (this.parentElement.tagName == 'FOOTER') target = this.lastElementChild;
		if (!(touch.clientX > X - 4 && touch.clientX < X + 4 && touch.clientY > Y - 4 && touch.clientY < Y + 4)) {
			target.classList.add('fade-out');
			if (!timer2) target.classList.remove('appear');
		}
		return false;
	}
	this.parentElement.lastElementChild.classList.add('fade-out');
	if (!timer2) this.parentElement.lastElementChild.classList.remove('appear');
}