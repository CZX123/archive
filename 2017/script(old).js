var $html = document.getElementsByTagName('html')[0],
	$nav = document.getElementsByTagName('nav')[0],
	$menu = document.getElementsByClassName('menu')[0],
	$header = document.getElementsByTagName('header')[1],
	$ghost = document.getElementsByClassName('ghost')[0],
	$navdrawer = document.getElementsByClassName('nav-drawer')[0],
	$scrim = document.getElementsByClassName('scrim')[0],
	$fab = document.getElementsByClassName('fab')[0];

setTimeout(function() {
	$nav.classList.remove('animate');
}, 500);
setTimeout(function() {
	$menu.classList.add('slower');
	$menu.classList.remove('animate');
}, 1100);
setTimeout(function() {
	$menu.classList.remove('slower');
}, 1320);
setTimeout(function() {
	$fab.classList.add('slower');
	$fab.classList.remove('animate');
}, 1500);
setTimeout(function() {
	$fab.classList.remove('slower');
}, 1900);


$menu.addEventListener('click', function() {
	var w = $html.clientWidth;
	$navdrawer.classList.add('active');
	$html.style.overflow = 'hidden';
});
$scrim.addEventListener('click', function() {
	$navdrawer.classList.remove('active');
	$html.style.overflow = '';
});
var navheight;
function navHeight() {
	if (window.matchMedia('(max-height:450px)').matches) navheight = 48;
	else if (window.matchMedia('(max-width:767px)').matches) navheight = 56;
	else navheight = 64;
}
navHeight();
window.addEventListener('resize', navHeight);
var $navh1 = document.querySelector('nav h1'), $navimg = document.querySelector('nav .bg-image');
if ($nav.classList.contains('waterfall')) {
	window.addEventListener('scroll', function() {
		var y = window.pageYOffset;
		if (y < 256 - navheight) {
			$nav.classList.add('waterfall');
			$nav.style.height = 256 - y + 'px';
			$navh1.style.fontSize = 48 - 28*y/(256 - navheight) + 'px';
			$navh1.style.bottom = 18 + (navheight/2 - 36)*y/(256 - navheight) + 'px';
		}
		else {
			$nav.style.height = navheight + 'px';
			$navh1.style.fontSize = '20px';
			$navh1.style.bottom = navheight/2 - 18 + 'px';
			setTimeout(function() {$nav.classList.remove('waterfall');}, 1);
		}
		if (y > 256 - navheight || previous > 256 - navheight) {
			direction();
		}
	});
}
else {
	window.addEventListener('scroll', direction);
}
var previous = window.pageYOffset;
function direction() {
	var y = window.pageYOffset;
	if (y > previous) {
		if (window.getComputedStyle($ghost).getPropertyValue('opacity') != '0') {
			$nav.classList.add('hide');
			$menu.classList.add('hide');
			$header.classList.add('hide');
		}
		if (y > window.innerHeight - navheight && previous <= window.innerHeight - navheight && !$header.classList.contains('transform')) {
			$header.classList.add('instant');
			header();
		}
	}
	if (y < previous) {
		$nav.classList.remove('hide');
		$menu.classList.remove('hide');
		$header.classList.remove('hide');
		var y = window.pageYOffset;
		if (y <= window.innerHeight/2 - 32) {
			$header.classList.remove('transform');
		}
	}
	if (y == previous && y >= window.innerHeight - navheight) {
		$header.classList.add('transform');
	}
	previous = y;
	backToTop();
}
function header() {
	setTimeout(function() {
		$header.classList.remove('instant');
	}, 300);
	$header.classList.add('transform');
}
$ghost.addEventListener('mouseenter', function() {
	$nav.classList.remove('hide');
	$menu.classList.remove('hide');
	$header.classList.remove('hide');
});

var $sections = document.getElementsByTagName('section');
function getOrder() {
	var startingY = window.pageYOffset, i = 0;
	while (i < $sections.length) {
		if (startingY >= $sections[i].offsetTop - 20) {
			i++;
			if (i == $sections.length) {
				doScrolling(-1, 1200);
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
		duration = 500;
		diff = $sections[0].offsetTop - navheight - startingY;
		if (diff == 0) {
			diff = $sections[1].offsetTop - startingY;
		}
	}
	else if (order != -1) {
		diff = $sections[order].offsetTop - startingY;
	}
	else {
		diff = -startingY;
	}
	window.requestAnimationFrame(function step(timestamp) {
		if (!start) start = timestamp;
		var time = timestamp - start,
			percent = Math.min(time / duration, 1);
		percent = easing(percent);
		window.scrollTo(0, startingY + diff * percent);
		if (time < duration) {
			window.requestAnimationFrame(step);
		}
	});
}
function backToTop() {
	var y = window.pageYOffset, $lastsection = $sections[$sections.length - 1];
	if (y < $lastsection.offsetTop - 20) {
		$fab.classList.remove('back-to-top');
	}
	else {
		$fab.classList.add('back-to-top');
	}
}
$fab.addEventListener('mouseenter', function() {
	$html.style.willChange = 'scroll-position';
});
$fab.addEventListener('mouseleave', function() {
	$html.style.willChange = '';
});
$fab.addEventListener('click', getOrder);

// Ripple effect

var $ripple = Array.prototype.slice.call(document.querySelectorAll('.nav-drawer ul li a, button'));
$ripple.splice($ripple.indexOf($menu), 1);
var i, flag = false, timer = 0, destination, $beingpressed = [], target, $beingreleased, x, y;
for (i = 0; i < $ripple.length; i++) {
	$ripple[i].addEventListener('mousedown', mousePressed);
	$ripple[i].addEventListener('mouseup', mouseReleased);
	$ripple[i].addEventListener('touchstart', touchPressed);
	$ripple[i].addEventListener('touchend', touchReleased);
	$ripple[i].addEventListener('touchcancel', touchReleased);
	$ripple[i].addEventListener('contextmenu', rightClick);
}
function touchPressed(e) {
	if (timer != 0) clearTimeout(timer);
	timer = 0;
	flag = true;
	var n = e.touches.length - 1;
	if (this.tagName == 'BUTTON') {
		x = e.touches[n].clientX - this.getBoundingClientRect().left - this.children[0].offsetLeft - 28;
		y = e.touches[n].clientY - this.getBoundingClientRect().top - this.children[0].offsetTop - 28;
		if (this.classList.contains('fab')) {
			x = e.touches[n].clientX - this.offsetLeft - this.children[0].offsetLeft;
			y = e.touches[n].clientY - this.offsetTop - this.children[0].offsetTop - 28;
		}
	}
	else {
		x = e.touches[n].clientX - 28;
		y = e.touches[n].clientY - this.parentElement.offsetTop - 28;
	}
	$beingpressed.push(this);
	pressed();
}
function touchReleased() {
	timer = setTimeout(function() {
		flag = false;
	}, 500);
	this.removeEventListener('mouseleave', mouseReleased);
	$beingreleased = this;
	released();
}
function mousePressed(e) {
	if (!flag) {
		this.addEventListener('mouseleave', mouseReleased);
		if (this.tagName == 'BUTTON') {
			x = e.clientX - this.getBoundingClientRect().left - this.children[0].offsetLeft - 28;
			y = e.clientY - this.getBoundingClientRect().top - this.children[0].offsetTop - 28;
			if (this.classList.contains('fab')) {
				x = e.clientX - this.offsetLeft - this.children[0].offsetLeft;
				y = e.clientY - this.offsetTop - this.children[0].offsetTop - 28;
			}
		}
		else {
			x = e.clientX - 28;
			y = e.clientY - this.parentElement.getBoundingClientRect().top - 28;
		}
		$beingpressed.push(this);
		pressed();
	}
}
function mouseReleased() {
	if (!flag) {
		this.removeEventListener('mouseleave', mouseReleased);
		$beingreleased = this;
		released();
	}
}
function pressed() {
	var $lastelement = $beingpressed[$beingpressed.length - 1], point = x + 28, diff, time = 500;
	var $div = document.createElement('DIV');
	$div.className = 'ripple';
	$div.style.top = y + 'px';
	$div.style.left = x + 'px';
	destination = $lastelement.parentElement;
	if ($lastelement.tagName == 'BUTTON') {
		destination = $lastelement.children[0];
	}
	else {
		diff = Math.abs(point - destination.offsetWidth/2);
		time = -.8/destination.offsetWidth*diff + 1;
		$div.style.animationDuration = time + 's';
	}
	destination.appendChild($div);
}
function released() {
	var index = $beingpressed.indexOf($beingreleased), c, f;
	if (index == -1) return;
	else $beingpressed.splice(index, 1);
	target = $beingreleased.parentElement;
	if ($beingreleased.tagName == 'BUTTON') target = $beingreleased.children[0];
	var l = target.children.length;
	for (f = 0; f < l; f++) {
		if (target.children[f].classList) { // Needed for an IE bug
			if (target.children[f].classList.contains('ripple') && !target.children[f].classList.contains('fade-out')) {
				target.children[f].classList.add('fade-out');
				break;
			}
		}
	}
	setTimeout(function() {
		l = target.children.length;
		for (c = 0; c < l; c++) {
			if (target.children[c].classList) {
				if (target.children[c].classList.contains('ripple')) {
				target.removeChild(target.children[c]);
					break;
				}
			}
		}
	}, 800);
}
function rightClick() {
	var l = target.children.length, d;
	for (d = 0; d < l; d++) {
		if (target.children[d].classList) {
			if (target.children[d].classList.contains('ripple') && !target.children[d].classList.contains('fade-out')) {
				target.children[d].classList.add('fade-out');
			}
		}
	}
	setTimeout(function() {
		l = target.children.length;
		for (c = 0; c < l; c++) {
			if (target.children[c].classList) {
				if (target.children[c].classList.contains('ripple')) {
					target.removeChild(target.children[c]);
				}
			}
		}
	}, 1000);
}