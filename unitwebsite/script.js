// Variables html and body, and other stuff are included inline in every HTML file
var html = document.documentElement,
	body = document.body;

// First checks if passive event listeners are supported. Passive event listeners help to improve touch latency and overall performance.
var supportsPassive = false;
document.createElement('div').addEventListener('test', function () { }, {
	get passive() {
		supportsPassive = true;
		return false;
	}
});

// Support for tabbing
window.onkeyup = function (e) {
	if (e.keyCode == 9) body.classList.add('tabbing');
};
window.addEventListener('mousedown', function () {
	body.classList.remove('tabbing');
}, supportsPassive ? { passive: true } : false);


// Basic nav drawer interactions
var navdrawer = document.getElementsByClassName('nav-drawer')[0],
	scrim = document.getElementsByClassName('scrim')[0],
	navAppear = false, // check if nav drawer is currently in view
	pwaInstallButton = navdrawer.querySelector('.pwa-install button'),
	deferredPrompt;

window.addEventListener('beforeinstallprompt', function(e) {
	deferredPrompt = e;
	navdrawer.classList.add('pwa-prompt');
});

pwaInstallButton.addEventListener('click', function() {
	deferredPrompt.prompt();
});

window.addEventListener('appinstalled', function() {
	navdrawer.classList.remove('pwa-prompt');
	deferredPrompt = null;
});

// Toggle class when a dropdown is clicked
// This is placed in front so that the function can be called when window resizes
var dropdown = document.querySelectorAll('.nav-drawer ul li.dropdown, section.main button.dropdown'),
	dropdowncontent;

// AJAX object for crossfade transition between pages
// How it works:
// There are 3 main elements that has to be changed between pages, the apge specific styles, the main content, and the page specific script. These 3 are all illustrated below, with the rest of the variables aiding in the transition.
var Ajax = {
	content: document.getElementsByClassName('ajax-content')[0],
	style: document.getElementsByClassName('ajax-style')[0],
	script: null, // null first because the ajax-script element does not exist yet since this script is loaded before the ajax script. This value here will be updated once the ajax script loads.
	animationComplete: false,
	fileRequested: false,
	newContent: null, // Actually these 4 are not needed, just an indication of what is to come
	newStyle: null,
	newScript: null,
	newTitle: null,
	oldUrl: window.location.href, // To revert back to old page address if the new page fails to load when pressing back or forward button
	pageSwitchY: window.pageYOffset, // The scroll value which helps prevent jumping when switching pages
	pageSwitching: false, // A boolean to check if page is currently being switched to prevent spamming

	pageRequest: function (url) {
		// First check if page is currently switching, then abort if it is
		if (Ajax.pageSwitching) {
			// Check if user pressed back or user clicked on link.
			// If user pressed back or forward the first 4 letters of url would be http, since the url is an absolute link
			// Else if the user clicked the url would be a relative link, so first four letters confirmed not to be 'http', unless you have some 'http.html' file or something (Please don't)
			// This way of checking is repeated below,
			if (url.substring(0, 4) == 'http') history.pushState(null, null, oldUrl);
			return false;
		}
		// Update the values
		Ajax.pageSwitchY = latestY;
		Ajax.oldUrl = window.location.href;
		Ajax.pageSwitching = true;
		Ajax.fileRequested = false;
		Ajax.animationComplete = false;
		// Add progress bar on top
		body.classList.add('loading');
		body.classList.add('indeterminate');
		// Start hide transition
		Ajax.content.classList.add('hide');
		// A timer to check when is the transition complete. Fixed time of 280ms for the transition
		setTimeout(function () {
			// if both hide transition is complate and page is loaded, then start to change content
			if (Ajax.fileRequested) Ajax.changeContent();
			Ajax.animationComplete = true;
		}, 280);
		// XMLHttpRequest below to load the other page
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			window.scrollTo(0, Ajax.pageSwitchY); // Prevent scroll jumping first
			// new element for containing the new filé's HTML content
			var elem = document.createElement('div');
			elem.innerHTML = xhr.responseText;
			// Updating the values for the new content
			Ajax.newContent = elem.getElementsByClassName('ajax-content')[0];
			Ajax.newStyle = elem.getElementsByClassName('ajax-style')[0];
			Ajax.newScript = elem.getElementsByClassName('ajax-script')[0];
			if (elem.getElementsByTagName('title')[0]) Ajax.newTitle = elem.getElementsByTagName('title')[0].innerText;
			// If the new content does not exist, then throw error and abort.
			if (!Ajax.newContent) {
				error();
				body.classList.remove('loading');
				Ajax.content.classList.remove('hide');
				Ajax.pageSwitching = false;
				setTimeout(function () {
					Ajax.animationComplete = false;
				}, 280);
				return false;
			}
			// Check if user pressed back, because if the user has already pressed back, the new location has already been updated. If he did not, we would have to manually update the new address below.
			if (url.substring(0, 4) != 'http') history.pushState(null, null, url);
			// Update oldUrl to current one since the current one has successfully loaded
			Ajax.oldUrl = window.location.href;
			Ajax.fileRequested = true;
			if (Ajax.animationComplete) Ajax.changeContent();
		};
		// If page fails to load due to internet or 404 error or something else, then throw error and revert the relevant stuff
		xhr.onabort = xhr.onerror = function () {
			error();
			Ajax.content.classList.remove('hide');
			body.classList.remove('loading');
			Ajax.pageSwitching = false;
			setTimeout(function () {
				Ajax.animationComplete = false;
			}, 280);
			return false;
		};
		xhr.open('GET', url);
		xhr.send();
	},

	changeContent: function () {
		Ajax.removeListener(); // This function is to remove all existing listeners on the current page since AJAX navigation makes the site a single page application and javascript does not change. By default, the function is empty, so redefine it in the script section of the HTML page.
		window.scrollTo(0, 0); // Scroll to top of page when new content loads, following default browser behaviour

		// Replace the content
		document.title = Ajax.newTitle;
		Ajax.content.style.position = 'absolute'; // Position absolute to remove old content from document flow so it takes up no space at all
		Ajax.content.insertAdjacentElement('afterend', Ajax.newContent);
		Ajax.content.parentNode.removeChild(Ajax.content);
		Ajax.style.insertAdjacentElement('afterend', Ajax.newStyle);
		Ajax.style.parentNode.removeChild(Ajax.style);
		Ajax.script.parentNode.removeChild(Ajax.script);
		// For replacing script, a bit special since inserting it like the way above doesn't run the code, so only the below way works
		var script = document.createElement('script');
		script.classList.add('ajax-script');
		script.text = Ajax.newScript.innerText;
		// IMPORTANT: In Internet Explorer, the script's content (script.text) is all on one line instead of being cleanly formatted like other browsers. Since all of it is on one line, NO SINGLE LINE COMMENTS ARE ALLOWED! NO '//' characters are allowed, since anything after this 2 // will be a comment and ignored. Multiple line comments (/* */) are ok though, as long it is closed properly.
		body.appendChild(script);
		// Updating the values of the new content
		Ajax.content = Ajax.newContent;
		Ajax.style = Ajax.newStyle;
		Ajax.script = document.getElementsByClassName('ajax-script')[0];
		// Adding class of show to start fade in animation
		Ajax.content.classList.add('show');
		setTimeout(function () {
			Ajax.content.classList.remove('show'); // Remove class after animation is complete
		}, 500);
		// Read the current address to determine which link to highlight in the navdrawer
		var split = window.location.href.split('/'), // split the address by the '/' symbol
			filename = split.pop(), // Take the last rightmost chunk
			currentActive = navdrawer.getElementsByClassName('active'), // Get currently highlighted element
			newActive = navdrawer.querySelector('a[href="' + filename + '"]'); // Get the element that is to be highlighted
		if (!filename) newActive = navdrawer.querySelector('a[href="./"]'); // Special case for homepage
		// Remove all currently highlighted links
		for (var c = 0, l = currentActive.length; c < l; c++) {
			currentActive[0].classList.remove('active'); // Note the [0], and not [c], because once the 'active' class is removed, the element is removed from the currentActive array, so the next element would be currentActive[0] also
			currentActive = navdrawer.getElementsByClassName('active'); // Redefining it just in case the elemement is somehow not removed from the array
		}
		// Check if the newActive element exists, just in case
		if (newActive) {
			// Add new highlighted link. 'active' class is added to the parent of the <a> element, which is the <li> element
			newActive.parentElement.classList.add('active');
			// Dropdowns also need to have the 'active' class, so the below code locates the dropdown link
			var activeDropdown = newActive.parentElement.parentElement.parentElement.previousElementSibling;
			// Need to check if their is a dropdown for the link in the first place, because of that one special case of the homepage
			if (activeDropdown) activeDropdown.classList.add('active');
		}
		// Below 2 to add relevant listeners to the dropdowns and also all buttons in the new content for the ripple effect
		dropdownCheck();
		rippleCheck();
		lazyLoadImages(); // lazy load images with attribute of 'data-src'
		externalLinksNoopener(); // Add rel="noopener" for external links
		// Show the navbar always
		navbar.classList.remove('hide');
		// End page switching
		Ajax.pageSwitching = false;
		// Remove the progress bar
		setTimeout(function () {
			body.classList.remove('loading');
		}, 300);
	},

	removeListener: function () {} // Empty function to be defined later in the ajax-script
};
window.addEventListener('popstate', onPopState);
function onPopState() {
	Ajax.pageRequest(window.location.href);
}

var flktyResizeCounter = 0;
function flktyResize() {
	flktyResizeCounter++;
	flkty.resize();
	if (flktyResizeCounter < 20) requestAnimationFrame(flktyResize);
	else flktyResizeCounter = 0;
}
var navTransitionDelay = 0;

// All click listeners combined into a single one
// Read up more on event bubbling if you don't understand the below code
document.addEventListener('click', function(e) {
	var elem = e.target;
	// Bubble up the elements list if the below conditions are not met
	while (elem && !elem.classList.contains('dropdown') && !elem.classList.contains('menu') && !elem.classList.contains('scrim') && (elem.tagName != 'A' || elem.target || !elem.href)) {
		elem = elem.parentElement;
	}
	if (!elem) return false; // Abort if element does not fulfill the above criteria
	// Case 1: Element is a link in the navdrawer
	if (elem.tagName == 'A' && !elem.target && elem.href) {
		var firstFourCharacters = elem.getAttribute('href').substring(0,4);
		if (firstFourCharacters == 'http' || firstFourCharacters == 'mail') return false; // Check if link is absolute since all navdrawer links are relative. Also check for mailto: links. So don't go create a mail.html page
		if (e.shiftKey) return false; // Shift + click opens in a new window, so no page transition needed
		if (navigator.userAgent.indexOf('Mac OS X') != -1) {
			if (e.metaKey) return false; // Command + click in Mac opens in new tab
		}
		else if (e.ctrlKey) return false; // Ctrl + click in everywhere else opens in new tab
		e.preventDefault(); // Prevent default link clicking behavior, which is to instantly load the new page
		if (window.matchMedia('(max-width:1023px),(max-height:449px)').matches) scrim.click(); // To close the nav drawer
		Ajax.pageRequest(elem.getAttribute('href')); // Implement own AJAX navigation
	}
	else if (elem.classList) { // Need to check if element has a class to prevent errors
		// Case 2: Element is the menu
		// Click the menu to toggle the nav drawer
		if (elem.classList.contains('menu')) {
			if (body.classList.contains('nav-active')) {
				navAppear = false;
				html.removeAttribute('style');
			}
			else {
				navAppear = true;
				html.style.overflow = 'hidden';
			}
			body.classList.toggle('nav-active');
			navdrawer.removeAttribute('style');
			if (navTransitionDelay) clearTimeout(navTransitionDelay);
			navdrawer.style.transitionDelay = '0s';
			scrim.removeAttribute('style');
			dropdownCheck();
			navTransitionDelay = setTimeout(function() {
				navdrawer.style.transitionDelay = '';
				navTransitionDelay = 0;
			}, 400);
			if (window.matchMedia('(min-width:1024px) and (min-height:450px)').matches && typeof(flkty) != 'undefined') {
				if (flkty) requestAnimationFrame(flktyResize);
			}
		}
		// Case 3: Element is the scrim
		// Click the scrim to close the nav drawer
		else if (elem.classList.contains('scrim')) {
			navAppear = false;
			body.classList.remove('nav-active');
			navdrawer.removeAttribute('style');
			scrim.removeAttribute('style');
			html.removeAttribute('style');
			dropdownCheck();
		}
		// Case 4: Element is a dropdown link
		else if (elem.classList.contains('dropdown')) {
			// Locates the dropdown content relative to the dropdown link
			dropdowncontent = elem.nextElementSibling.children[0];
			// If elem has attribute of 'data-fetch' (only applicable for roh since clicking the dropdown fetches the roh for that year), or the dropdown is still animating, then abort
			if (elem.hasAttribute('data-fetch')) return false;
			elem.classList.toggle('dropdown-open'); // Toggle the class
			var links = dropdowncontent.getElementsByTagName('a'),
				linkslength = links.length,
				a,
				dropdownopen = elem.classList.contains('dropdown-open');
			// (someBoolean) ? doThisOnlyIf(someBoolean)IsTrue : elseDoThisInstead
			if (dropdownopen) {
				requestAnimationFrame(function(timestamp) {
					dropdownTransition(dropdowncontent, -dropdowncontent.offsetHeight, 0, timestamp, null);
				});
			}
			else {
				requestAnimationFrame(function(timestamp) {
					dropdownTransition(dropdowncontent, 0, -dropdowncontent.offsetHeight, timestamp, null);
				});
			}
			for (a = 0; a < linkslength; a++) {
				// Need to make each link in dropdown untabbable when dropdown is hidden
				dropdownopen ? links[a].removeAttribute('tabindex') : links[a].tabIndex = '-1';
			}
		}
	}
});
// An easing function for use in the opening or closing the nav drawer after the user lifts off his finger after dragging
// t = time since animation started
// b = starting value
// c = ending value - starting value = difference between end and start
// d = total duration of animation
// Easing function would only be used in requestAnimationFrame, where usually it runs at 60 fps. d would then be the duration of the animation, measured in terms of frames. A value of 60 for d means that the animation would last 1s, a value of 30 means 0.5s, and so on...
function easeOutCubic(t, b, c, d) {
	return Math.round((-c*((t=t/d-1)*t*t*t - 1) + b)*10)/10;
}
// Selects all dropdowns and checks for class of dropdown-open, then adds the respective styles
function dropdownCheck() {
	// Redefine dropdown to include ALL dropdowns in the page if the page changes
	// Most of the code here is similar to the dropdown click above
	dropdown = document.querySelectorAll('.nav-drawer ul li.dropdown, section.main button.dropdown');
	for (var d = 0; d < dropdown.length; d++) {
		dropdowncontent = dropdown[d].nextElementSibling.children[0];
		var links = dropdowncontent.getElementsByTagName('a'),
			linkslength = links.length,
			a,
			dropdownopen = dropdown[d].classList.contains('dropdown-open');
		dropdownopen ? dropdowncontent.style.marginTop = '0'
			: dropdowncontent.style.marginTop = (-dropdowncontent.offsetHeight) + 'px';
		for (a = 0; a < linkslength; a++) {
			dropdownopen ? links[a].removeAttribute('tabindex') : links[a].tabIndex = '-1';
		}
	}
}
dropdownCheck();
document.addEventListener('DOMContentLoaded', function() {
	setTimeout(dropdownCheck, 100);
});
function dropdownTransition(elem, start, end, timestamp, startingTimestamp) {
	// Define duration in milliseconds, and progress too
	var duration = 500,
		progress = 0;
	if (!startingTimestamp) startingTimestamp = timestamp;
	else progress = timestamp - startingTimestamp;
	// Only the navdrawer dropdown's content doesn't have the class of 'wrapper'. The navdrawer's dropdowns are smaller in height, so they can have a faster transition
	if (!elem.classList.contains('wrapper')) duration = 400;
	if (progress < duration) {
		elem.style.marginTop = easeOutCubic(progress, start, end - start, duration) + 'px'; // The easeOutCobic function creates a very nice easing effect for the transition. Use it properly and it would work like magic.
		requestAnimationFrame(function(timestamp) {
			dropdownTransition(elem, start, end, timestamp, startingTimestamp);
		});
	}
	else {
		elem.style.marginTop = end + 'px';
		if (!elem.classList.contains('wrapper') && navdrawerHover && body.classList.contains('nav-active')) navdrawer.style.width = 300 + navdrawer.firstElementChild.offsetWidth - navdrawer.firstElementChild.clientWidth + 'px';
	}
}

// Scrolling listener for stuff like the navbar hide action and parallax effect (if have)
var	navbar = document.getElementsByClassName('navbar')[0],
	latestY = window.pageYOffset,
	previousY,
	resize,
	isIE = navigator.userAgent.indexOf('Edge') > -1 || navigator.userAgent.indexOf('Trident/7.0') > -1,
	mousemove = true,
	parallax = false; // By default there is no parallax element and mousemove variable for the carousel. Add the parallax element in the script tag on pages with the element. There is no need to define mousemove though.

// Resize listener to detect window size changes
window.addEventListener('resize', function() {
	resize = true;
});

// Detect if mouse is hovering above the navbar or if mouse is aroung the spot of the navbar if navbar is hidden
var menu = document.getElementsByClassName('menu')[0],
	navhover,
	navfocus;

navbar.addEventListener('mouseenter', navEnter);
navbar.addEventListener('mouseleave', navLeave);
function navEnter() {
	navhover = true;
	navbar.classList.remove('hide');
}
function navLeave() {
	navhover = false;
}

menu.addEventListener('focus', function() {
	navfocus = true;
});
menu.addEventListener('blur', function() {
	navfocus = false;
});
// The scrolling function that gets called 60 times a second to ensure smooth performance. The parallax refers to the top element which would have a parallax effect when scrolling down. parallax needs to be initialised separately for each individual page which needs it
function scrolling() {
	latestY = window.pageYOffset;
	if (latestY != previousY || resize) {
		if (resize) {
			resize = false;
			dropdownCheck();
			scrollbarWidth = getScrollbarWidth();
			navdrawer.firstElementChild.style.width = 300 + scrollbarWidth + 'px';
		}
		if (parallax && window.matchMedia('(min-width:768px)').matches && latestY <= parallax.clientHeight && isIE == false) {
			parallax.style.transform = 'translate3d(0,' + Math.round(Math.pow(latestY, .85) / (2 * Math.pow(parallax.clientHeight,-.15))*1e2)/1e2 + 'px,0)';
		}
		if (parallax && latestY <= parallax.clientHeight) {
			parallax.style.opacity = 1 - latestY/parallax.clientHeight;
		}
	}
	if (mousemove && latestY < 20 && parallax) {
		navbar.classList.remove('hide');
		parallax.classList.add('mousemove');
	}
	else if (parallax) {
		if (!mousemove && latestY < 20 && !navhover) navbar.classList.add('hide');
		parallax.classList.remove('mousemove');
	}
	if (latestY > previousY && latestY >= 20 && !navhover && (!navfocus || !body.classList.contains('tabbing'))) {
		navbar.classList.add('hide');
	}
	if ((!parallax || latestY >= 20) && latestY < previousY || latestY != previousY && previousY == null || navfocus && body.classList.contains('tabbing')) {
		navbar.classList.remove('hide');
	}
	previousY = latestY;
	requestAnimationFrame(scrolling);
}
scrolling();

// Detect window scrollbar width, and apply this when nav drawer is hovered
var navTooltip = document.getElementsByClassName('nav-links-tooltip')[0],
	navTooltipContent = navTooltip.firstElementChild.firstElementChild,
	navTooltipContentHidden = navTooltipContent.nextElementSibling,
	navTooltipTimer = 0,
	navdrawerTouch = false,
	navdrawerTouchTimer;
navTooltip.style.opacity = '0';
function getScrollbarWidth() {
	var outer = document.createElement('div');
	outer.style.position = 'absolute';
	outer.style.width = '100px';
	outer.style.height = '100px';
	outer.style.msOverflowStyle = 'scrollbar';
	outer.style.overflow = 'scroll';
	body.appendChild(outer);
	var widthNoScroll = outer.offsetWidth;
	var widthWithScroll = outer.clientWidth;
	body.removeChild(outer);
	return widthNoScroll - widthWithScroll;
}
var scrollbarWidth = getScrollbarWidth();
var navdrawerHover = false;
navdrawer.firstElementChild.style.width = 300 + scrollbarWidth + 'px';
function navdrawerHoverFn() {
	navdrawerHover = true;
	navdrawer.classList.add('hover');
	if (body.classList.contains('nav-active')) navdrawer.style.width = 300 + navdrawer.firstElementChild.offsetWidth - navdrawer.firstElementChild.clientWidth + 'px';
}
function navdrawerChangeHoverFn(target) {
	if (!body.classList.contains('nav-active') && window.matchMedia('(min-width:768px) and (min-height:450px)').matches) navTooltipAppear(target);
}
function navdrawerLeaveFn() {
	navdrawerHover = false;
	navdrawer.classList.remove('hover');
	navdrawer.style.width = '';
	navTooltip.style.opacity = '0';
}
if ('PointerEvent' in window) {
	navdrawer.addEventListener('pointerenter', navdrawerHoverFn);
	navdrawer.addEventListener('pointerover', function(e) {
		navdrawerChangeHoverFn(e.target);
	});
	navdrawer.addEventListener('pointerleave', navdrawerLeaveFn);
}
else {
	navdrawer.addEventListener('mouseenter', function() {
		if (!navdrawerTouch) navdrawerHoverFn();
	});
	navdrawer.addEventListener('mouseover', function(e) {
		if (!navdrawerTouch) navdrawerChangeHoverFn(e.target);
	});
	navdrawer.addEventListener('mouseleave', function() {
		if (!navdrawerTouch) navdrawerLeaveFn();
	});
	navdrawer.addEventListener('touchstart', function(e) {
		clearTimeout(navdrawerTouchTimer);
		navdrawerTouch = true;
		navdrawerHoverFn();
		navdrawerChangeHoverFn(e.touches[0].target);
	});
	navdrawer.addEventListener('touchend', function() {
		navdrawerLeaveFn();
		navdrawerTouchTimer = setTimeout(function() {
			navdrawerTouch = false;
		}, 400);
	});
	navdrawer.addEventListener('touchmove', function() {
		navdrawerLeaveFn();
		navdrawerTouchTimer = setTimeout(function() {
			navdrawerTouch = false;
		}, 400);
	});
	navdrawer.addEventListener('touchcancel', function() {
		navdrawerLeaveFn();
		navdrawerTouchTimer = setTimeout(function() {
			navdrawerTouch = false;
		}, 400);
	});
}
function navTooltipAppear(target) {
	clearTimeout(navTooltipTimer);
	var elem = target;
	while (elem && elem.tagName != 'A' && elem.tagName != 'BUTTON') {
		elem = elem.parentElement;
	}
	if (!elem) {
		navTooltip.style.opacity = '0';
		return false;
	}
	var content = elem.innerText,
		topOffset = 0;
	var elem2 = target;
	while (elem2) {
		topOffset = topOffset + elem2.offsetTop;
		elem2 = elem2.parentElement;
	}
	navTooltip.style.transition = '';
	navTooltip.firstElementChild.style.transition = '';
	navTooltip.style.transform = 'translateY(' + (topOffset + elem.offsetHeight / 2 - 20 - navdrawer.firstElementChild.scrollTop) + 'px)';
	navTooltipContentHidden.innerText = content;
	navTooltip.firstElementChild.style.width = (navTooltipContentHidden.offsetWidth + 40) + 'px';
	if (navTooltip.style.opacity == '0') {
		navTooltip.style.opacity = '1';
		navTooltip.style.transition = 'opacity .2s';
		navTooltipContent.style.opacity = '1';
		navTooltipContent.innerText = content;
		navTooltip.firstElementChild.style.transition = 'none';
	}
	else {
		navTooltip.style.opacity = '1';
		navTooltipContent.style.opacity = '0';
		navTooltipContent.style.transitionDuration = '.08s';
		navTooltipTimer = setTimeout(function() {
			navTooltipContent.innerText = content;
			navTooltipContent.style.opacity = '1';
			navTooltipContent.style.transitionDuration = '';
		}, 80);
	}
}

// Draggable nav drawer
var	dragnavdrawer = document.getElementsByClassName('drag-nav-drawer')[0],
	initialX = 0, // The starting x-coordinate
	actualX = 0, // The actual x-coordinate of the finger when dragging
	navX = 0, // Similar to above but maximum can only be the nav drawer's width (most of the time 300px), while actualX can go beyond that. This is to prevent the nav drawer from being dragged to far right and creating an obvious gap on the left
	previousNavX = 0, // The previous value of navX. It is carried over to check for the direction of movement
	diffX = 0, // The diference between previousNavX and current NavX
	dragging = false, // Check if user is draggging or not
	draggingtimer,
	navdrawerwidth = navdrawer.offsetWidth, // Nav drawer's width. It may change at narrow screen sizes.
	navTranslate, // The x-coordinate to be used for the nav drawer itself
	start,
	ripplebug, // This is a variable to help in solving a bug where clicking a link in the nav drawer closes the nav drawer
	navdrawerscrolling,
	navdrawerscrollingtimer,
	startingTimestamp;

// A listener to detect whether navdrawer is being scrolled so as to prevent dragging of navdrawer
navdrawer.lastElementChild.addEventListener('scroll', function() {
	clearTimeout(navdrawerscrollingtimer);
	navdrawerscrolling = true;
	if (!dragging) {
		navdrawerscrollingtimer = setTimeout(function() {
			if (!dragging) navdrawerscrolling = false;
		}, 300);
	}
});

document.addEventListener('touchstart', startDrag, supportsPassive ? {passive: true} : false);
document.addEventListener('touchmove', mainDrag, supportsPassive ? {passive: true} : false);
document.addEventListener('touchend', endDrag, supportsPassive ? {passive: true} : false);
document.addEventListener('touchcancel', endDrag, supportsPassive ? {passive: true} : false);
// The dragging function. Uses requestAnimationFrame for smooth framerate
function navDragging(timestamp) {
	if (navdrawerscrolling) {
		dragging = false;
		navAppear = true;
		navdrawer.style.transform = '';
		scrim.style.opacity = '';
		navdrawer.classList.remove('dragging');
		diffX = 3;
		requestAnimationFrame(navDragging);
		return false;
	}
	if (window.matchMedia('(min-width:768px) and (min-height:450px)').matches) return false;
	if (dragging == 'started') {
		requestAnimationFrame(navDragging);
		return false;
	}
	if (dragging) navTranslate = navX - navdrawerwidth;
	navdrawer.style.transform = 'translate3d(' + navTranslate + 'px,0,0)';
	scrim.style.opacity = Math.round((navTranslate + navdrawerwidth)/navdrawerwidth*1e2)/1e2;
	if (dragging) {
		requestAnimationFrame(navDragging);
		navdrawer.classList.add('dragging'); // This class is to enable the CSS to create an element that covers the links in the nav drawer to prevent accidental touches
	}
	else {
		clearTimeout(draggingtimer);
		var duration = 500,
			progress = 0;
		if (!start) start = navTranslate;
		if (!startingTimestamp) startingTimestamp = timestamp;
		else progress = timestamp - startingTimestamp;
		if (diffX >= 4 || diffX < -4) duration = Math.round(-15 * Math.abs(diffX) + 500);
		if (diffX >= 24 || diffX <= -24) duration = 140;
		// When dragging the nav drawer into view but force is not enough OR dragging it out of view and force is enough
		if (diffX <= -1.5 || -1.5 < diffX && diffX < 1.5 && navX < navdrawerwidth/2) {
			navTranslate = easeOutCubic(Math.min(progress, duration), start, 0 - navdrawerwidth - start, duration);
			if (progress < duration && start != -navdrawerwidth) {
				requestAnimationFrame(navDragging);
			}
			else {
				navdrawer.removeAttribute('style');
				scrim.removeAttribute('style');
				body.classList.remove('nav-active');
				html.removeAttribute('style');
				navdrawer.classList.remove('dragging');
				dropdownCheck();
				start = null;
				startingTimestamp = null;
			}
		}
		// When dragging the nav drawer into view and force is enough OR dragging it out of view but force is not enough
		else {
			navTranslate = easeOutCubic(Math.min(progress, duration), start, -start, duration);
			if (progress < duration && start != 0 && !ripplebug) {
				requestAnimationFrame(navDragging);
			}
			else {
				navdrawer.removeAttribute('style');
				scrim.removeAttribute('style');
				start = null;
				startingTimestamp = null;
				navdrawer.classList.remove('dragging');
			}
			if (ripplebug) ripplebug = false;
		}
	}
}
// The initial touch
function startDrag(e) {
	if (window.matchMedia('(min-width:768px) and (min-height:450px)').matches) return false;
	// If user's touch is on the left edge on the screen
	if (e.target == dragnavdrawer) {
		dragging = true;
		navdrawerwidth = navdrawer.offsetWidth;
		actualX = previousNavX = navX = Math.round(e.touches[0].clientX*1e2)/1e2;
		requestAnimationFrame(navDragging);
		body.classList.add('nav-active');
	}
	// If nav drawer is already open and user's touch is anywhere on the screen
	else if (navAppear) {
		dragging = 'started';
		navdrawerwidth = navdrawer.offsetWidth;
		actualX = initialX = Math.round(e.touches[0].clientX*1e2)/1e2;
		// previousNavX = navX = Math.round(e.touches[0].clientX*10)/10 - initialX + navdrawerwidth; Simplified
		previousNavX = navX = navdrawerwidth;
		diffX = 0;
		cancelAnimationFrame(navDragging);
		navDragging();
	}
}
// Dragging
function mainDrag(e) {
	if (window.matchMedia('(min-width:768px) and (min-height:450px)').matches) return false;
	if (e.target == dragnavdrawer) {
		clearTimeout(draggingtimer);
		navdrawer.style.transition = 'none';
		scrim.style.transition = 'none';
		actualX = Math.round(e.touches[0].clientX*1e2)/1e2;
		if (actualX >= navdrawerwidth) navX = navdrawerwidth;
		else navX = actualX;
		diffX = navX - previousNavX;
		previousNavX = navX;
		html.style.overflow = 'hidden';
		draggingtimer = setTimeout(function() {
			diffX = 0;
		}, 300);
	}
	else if (navAppear) {
		clearTimeout(draggingtimer);
		dragging = true;
		navdrawer.style.transition = 'none';
		scrim.style.transition = 'none';
		actualX = Math.round(e.touches[0].clientX*1e2)/1e2;
		if (actualX >= initialX) navX = navdrawerwidth;
		else navX = Math.round(e.touches[0].clientX*1e2)/1e2 - initialX + navdrawerwidth;
		diffX = navX - previousNavX;
		previousNavX = navX;
		draggingtimer = setTimeout(function() {
			diffX = 0;
		}, 300);
	}
}
// Finger leaves the screen
function endDrag(e) {
	if (window.matchMedia('(min-width:768px) and (min-height:450px)').matches) return false;
	if (e.target == dragnavdrawer) {
		dragging = false;
		dropdownCheck();
		navdrawerscrolling = false;
		if (diffX >= 1.5 || -1.5 < diffX && diffX < 1.5 && navX > navdrawerwidth/2) navAppear = true;
	}
	else if (navAppear) {
		if (dragging == 'started') ripplebug = true;
		dragging = false;
		dropdownCheck();
		navdrawerscrolling = false;
		if (diffX <= -1.5 || -1.5 < diffX && diffX < 1.5 && navX <= navdrawerwidth/2) navAppear = false;
	}
}


// Mouse hover effect + ripple effect
var	ripplelist = document.querySelectorAll('.nav-drawer ul li a, button'), // The elements to which a ripple effect is added to
	rippledown = false, // A boolean which states if the button is creatly being held and the ripple is active
	x, // x-coordinate of ripple circle's centre
	y, // y-coordinate of ripple circle's centre
	ripplecount = -1,
	rippletimerarray = [], // To prevent the ripple from disappearing too fast if the click was very fast
	rippleelementsarray = [],
	rippleTouch = false,
	rippleTouchTimer;

// Activate the ripple effect be adding a 'div' with the class of 'ripple' to every element in the ripplelist. Also adds the event listeners.
function rippleCheck() {
	ripplelist = document.querySelectorAll('.nav-drawer ul li a, button, a.button');
	for (var i = 0; i < ripplelist.length; i++) {
		var ripple = ripplelist[i].parentElement.lastElementChild;
		if (ripplelist[i].tagName == 'A' && ripplelist[i].classList) {
			if (ripplelist[i].classList.contains('button')) ripple = ripplelist[i].lastElementChild;
		}
		else ripple = ripplelist[i].lastElementChild.lastElementChild;
		if (ripple) {
			if (ripple.classList) {
				if (ripple.classList.contains('ripple')) continue;
			}
		}
		if (ripplelist[i].hasAttribute('disabled')) continue;
		var div = document.createElement('DIV');
		div.className = 'ripple';
		if (ripplelist[i].tagName == 'A') {
			if (ripplelist[i].classList) {
				if (ripplelist[i].classList.contains('button')) ripplelist[i].appendChild(div);
				else ripplelist[i].parentElement.appendChild(div);
			}
			else ripplelist[i].parentElement.appendChild(div);
		}
		else ripplelist[i].lastElementChild.appendChild(div);
		if ('PointerEvent' in window) {
			ripplelist[i].addEventListener('pointerdown', function(e) {
				rippleDown(this, [e.clientX - this.getBoundingClientRect().left,
					e.clientY - this.getBoundingClientRect().top]);
			});
			ripplelist[i].addEventListener('pointerup', function() {
				rippleUp(this);
			});
			ripplelist[i].addEventListener('pointerleave', function(e) {
				rippleUp(this);
				hover(this, e.pointerType, 'leave');
			});
			ripplelist[i].addEventListener('pointerenter', function(e) {
				hover(this, e.pointerType, 'enter');
			});
		}
		else {
			ripplelist[i].addEventListener('mousedown', function(e) {
				if (!rippleTouch) rippleDown(this, [e.clientX - this.getBoundingClientRect().left,
					e.clientY - this.getBoundingClientRect().top]);
			});
			ripplelist[i].addEventListener('mouseup', function() {
				if (!rippleTouch) rippleUp(this);
			});
			ripplelist[i].addEventListener('mouseleave', function() {
				if (!rippleTouch) {
					rippleUp(this);
					hover(this, 'mouse', 'leave');
				}
			});
			ripplelist[i].addEventListener('mouseenter', function() {
				if (!rippleTouch) hover(this, 'mouse', 'enter');
			});
			ripplelist[i].addEventListener('touchstart', function(e) {
				clearTimeout(rippleTouchTimer);
				rippleTouch = true;
				rippleDown(this, [e.touches[0].clientX - this.getBoundingClientRect().left,
					e.touches[0].clientY - this.getBoundingClientRect().top]);
			}, supportsPassive ? {passive: true} : false);
			ripplelist[i].addEventListener('touchend', function() {
				rippleUp(this);
				rippleTouchTimer = setTimeout(function () {
					rippleTouch = false;
				}, 400);
			}, supportsPassive ? {passive: true} : false);
			ripplelist[i].addEventListener('touchmove', function() {
				rippleUp(this);
				rippleTouchTimer = setTimeout(function () {
					rippleTouch = false;
				}, 400);
			}, supportsPassive ? {passive: true} : false);
			ripplelist[i].addEventListener('touchcancel', function() {
				rippleUp(this);
				rippleTouchTimer = setTimeout(function () {
					rippleTouch = false;
				}, 400);
			}, supportsPassive ? {passive: true} : false);
		}
	}
}
rippleCheck();
// This hover effect is needed to replace CSS ':hover' because ':hover' also happens with touchscreens which isn't ideal. Hover effects can only happen with a mouse.
function hover(element, e, direction) {
	if (e == 'touch') return false;
	if (direction == 'enter') element.classList.add('hover');
	else element.classList.remove('hover');
}
function rippleDown(element, e) {
	rippledown = true;
	var target = element.parentElement.lastElementChild;
	if (element.tagName == 'A' && element.classList) {
		if (element.classList.contains('button')) target = element.lastElementChild;
	}
	else target = element.lastElementChild.lastElementChild;
	for (var i = ripplecount; i > -1; i--) {
		if (rippleelementsarray[i] == element) {
			rippletimerarray[ripplecount] = 0;
			break;
		}
		else if (!rippleelementsarray[i]) {
			if (i == ripplecount) { // Empty both arrays and reset count when no ripples are happening
				ripplecount = -1;
				rippletimerarray = [];
				rippleelementsarray = [];
			}
			break;
		}
	}
	target.classList.remove('fade-out');
	target.classList.remove('finish');
	x = Math.round(e[0]);
	y = Math.round(e[1]);
	var radius = Math.ceil(Math.max(Math.sqrt(x*x + y*y),
		Math.sqrt(x*x + (element.offsetHeight-y)*(element.offsetHeight-y)),
		Math.sqrt((element.offsetWidth-x)*(element.offsetWidth-x) + y*y),
		Math.sqrt((element.offsetWidth-x)*(element.offsetWidth-x) + (element.offsetHeight-y)*(element.offsetHeight-y))
	) * 10) / 10;
	target.style.height = target.style.width = radius * 2 + 'px';
	target.style.top = y - radius + 'px';
	target.style.left = x - radius + 'px';
	target.classList.add('appear');
	ripplecount += 1;
	var pastripplecount = ripplecount;
	rippletimerarray[ripplecount] = setTimeout(function () {
		target.classList.add('finish');
		if (target.classList.contains('fade-out')) target.classList.remove('appear');
		rippleelementsarray[pastripplecount] = 0;
		rippletimerarray[pastripplecount] = 0;
	}, 400);
}
function rippleUp(element) {
	rippledown = false;
	var target = element.parentElement.lastElementChild;
	if (element.tagName == 'A' && element.classList) {
		if (element.classList.contains('button')) target = element.lastElementChild;
	}
	else target = element.lastElementChild.lastElementChild;
	target.classList.add('fade-out');
	if (!rippletimerarray[ripplecount]) {
		target.classList.remove('appear');
		rippleelementsarray[ripplecount] = 0; // Just in case
		rippletimerarray[ripplecount] = 0; // Just in case
	}
	else rippletimerarray[ripplecount] = element;
}

var	errorElem = document.getElementsByClassName('error')[0],
	errortimer,
	defaultErrorText = 'An error occured. Please try again later.',
	offlineText = 'Internet unavailable. Please try again later.';

function error() {
	if (errortimer) {
		errorElem.classList.remove('show');
		setTimeout(function() {
			errorElem.classList.add('show');
			if (navigator.onLine) errorElem.innerText = defaultErrorText;
			else errorElem.innerText = offlineText;
		}, 240);
	}
	else {
		errorElem.classList.add('show');
		if (navigator.onLine) errorElem.innerText = defaultErrorText;
		else errorElem.innerText = offlineText;
	}
	clearTimeout(errortimer);
	errortimer = setTimeout(function() {
		errorElem.classList.remove('show');
		errortimer = 0;
	}, 3000);
}

// Add rel="noopener" for external links
externalLinksNoopener();
function externalLinksNoopener() {
	var externalLinks = document.querySelectorAll('a[target="_blank"]'),
		length = externalLinks.length,
		l;
	for (l = 0; l < length; l++) {
		externalLinks[l].setAttribute('rel','noopener');
	}
}

window.ononline = function() {
	body.classList.remove('offline');
};
window.onoffline = function() {
	body.classList.add('offline');
};

// lazy load images with attribute of 'data-src'
function lazyLoadImages() {
	var images = document.getElementsByClassName('fade'), length = images.length, i;
	for (i = 0; i < length; i++) {
		if (images[i].complete) images[i].classList.add('loaded');
		else {
			images[i].addEventListener('load', function() {
				this.classList.add('loaded');
			});
		}
	}
}
lazyLoadImages();

// Service Worker Registration
if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('sw.js');
	});
}
