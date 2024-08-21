/**
 * demo2.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
{
	// Random number.
	const getRandomInt = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	class GlitchFx {
		constructor(el, imgs) {
			this.DOM = {};
			this.DOM.el = el;
			this.imgs = imgs;
			console.log(`thisdomel: ${this.DOM.el}`)
			this.totalImgs = this.imgs.length;
			this.options = {
				// Max and Min values for the time when to start the effect.
				glitchStart: {min: 500, max: 4000},
				// Max and Min values of time that an element keeps each state.
				glitchState: {min: 150, max: 400},
				// Number of times the glitch action is performed per iteration.
				glitchTotalIterations: 6,
				// The imgs slideshow interval.
				slideshowInterval: 400
			};
		}
		glitch() {
			this.isInactive = false;
			clearTimeout(this.glitchTimeout);
			this.glitchTimeout = setTimeout(() => {
				this.iteration = 0;
				this.glitchState().then(() => {
					if( !this.isInactive ) {
						this.glitch();
					}
				});
			}, getRandomInt(this.options.glitchStart.min, this.options.glitchStart.max));
		}
		glitchState() {
			return new Promise((resolve, reject) => {
				if( this.iteration < this.options.glitchTotalIterations ) {
					this.glitchStateTimeout = setTimeout(() => {
						this.DOM.el.style.transform = `translate3d(${getRandomInt(-0,0)}px,${getRandomInt(-0,0)}px,0px) rotate3d(0,0,1,${getRandomInt(-0,0)}deg)`;
						if( getRandomInt(0,3) < 2 ) {
							this.DOM.el.style.backgroundImage = `url(${this.imgs[getRandomInt(0,this.totalImgs-1)]})`;
							this.DOM.el.style.color = 'transparent';
						}
						else {
							this.DOM.el.style.backgroundImage = 'none';
							this.DOM.el.style.color = '';
						}

						this.iteration++;
						if( !this.isInactive ) {
							this.glitchState().then(() => resolve());
						}
					}, getRandomInt(this.options.glitchState.min, this.options.glitchState.max));
				}
				else {
					this.reset();
					resolve();
				}
			});
		}
		stop() {
			this.isInactive = true;
			clearTimeout(this.glitchTimeout);
			clearTimeout(this.glitchStateTimeout);
			this.reset();
			return this;
		}
		reset() {
			this.DOM.el.style.transform = 'translate3d(0,0,0) rotate3d(1,1,1,0)';
			this.DOM.el.style.backgroundImage = 'none';
			this.DOM.el.style.color = '';
		}
		changeImage(pos) {
			return new Promise((resolve, reject) => {
				this.DOM.el.style.color = 'transparent';
				this.DOM.el.style.backgroundImage = `url(${this.imgs[pos]})`;
				resolve();
			});
		}
		slideshow(pos) {
			pos = pos || 0;
			const interval = this.isSlideshowActive ? this.options.slideshowInterval : 0;
			const newpos = pos < this.totalImgs-2 ? pos+1 : 0;
			this.slideshowTimeout = setTimeout(() => this.changeImage(pos).then(() => this.slideshow(newpos)), interval);
			this.isSlideshowActive = true;
		}
		stopSlideshow() {
			clearTimeout(this.slideshowTimeout);
			this.isSlideshowActive = false;
			this.reset();
		}
	}

	class Letter {
		constructor(letter,pos) {
			this.DOM = {};
			this.DOM.letter = letter;
			console.log(this.DOM.letter)
			this.pos = pos;
			this.imgs = letter.parentNode.dataset[`imagesChar-${this.pos+1}`].split(',');
			this.imgs.push(letter.parentNode.dataset['brazilFlag']);
			let htmlstr = '';
			for(const img of this.imgs) {
				htmlstr += `<img src="${img}"/>`;
			}
			const imgWrapper = document.createElement('div');
			imgWrapper.className = 'hidden';
			imgWrapper.innerHTML = htmlstr;
			document.body.appendChild(imgWrapper);
			this.bgcolor = letter.parentNode.dataset['backgroundColors'].split(',')[this.pos];
			this.bgimage = letter.parentNode.dataset['backgroundImages'].split(',')[this.pos];
			this.gfx = new GlitchFx(this.DOM.letter, this.imgs);
			this.gfx.glitch();
			this.initEvents();
		}
		initEvents() {
			this.mouseenterFn = () => {
				this.gfx.stop().slideshow();
				document.body.style.backgroundColor = this.bgcolor;	
				document.body.style.backgroundImage = `url(${this.bgimage})`;	
				document.querySelector('.word--kidnap').style = `color: ${this.bgcolor}`
			};
			this.mouseleaveFn = () => {
				this.gfx.stopSlideshow();
				this.gfx.glitch();
				document.body.style.backgroundColor = '#191a19';
				let randomInt = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
				document.body.style.backgroundImage = `url(img/modelocol${randomInt}.png)`;	
			};
			this.DOM.letter.addEventListener('mouseenter', this.mouseenterFn);
			this.DOM.letter.addEventListener('mouseleave', this.mouseleaveFn);
			this.DOM.letter.addEventListener('touchstart', this.mouseenterFn);
			this.DOM.letter.addEventListener('touchend', this.mouseleaveFn);
		}
	}

	class Word {
		constructor(word) {
			this.DOM = {};
			this.DOM.word = word;
			this.layout();
		}
		layout() {
			charming(this.DOM.word, {classPrefix: 'letter'});
			Array.from(this.DOM.word.querySelectorAll('span')).forEach((letter,pos) => new Letter(letter, pos));
			imagesLoaded(document.querySelectorAll('div.hidden > img'), () => document.body.classList.remove('loading'));
		}
	}

	Array.from(document.querySelectorAll('.word')).forEach((word) => new Word(word));
};