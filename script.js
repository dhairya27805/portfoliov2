// script.js - Advanced Interactions
document.addEventListener('DOMContentLoaded', () => {
  const isDesktop = window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 768;

  // Custom Glass Cursor
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorGlass = document.querySelector('.cursor-glass');
  let mx = window.innerWidth/2, my = window.innerHeight/2;
  let cx = mx, cy = my;

  if (isDesktop) {
    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px)`;
      
      // Update global CSS vars for flashlight mask in About section
      // We calculate absolute page Y for the mask to work properly when scrolling
      document.documentElement.style.setProperty('--mouse-x', `${mx}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.pageY - document.querySelector('#about').offsetTop}px`);
    });

    const loop = () => {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      cursorGlass.style.transform = `translate(${cx}px, ${cy}px)`;
      
      // Hero clip mask logic (flashlight reveal)
      const filledText = document.querySelector('.filled-text');
      if (filledText) {
        const rect = filledText.getBoundingClientRect();
        // size of circle expands on hover
        filledText.style.clipPath = `circle(150px at ${cx - rect.left}px ${cy - rect.top}px)`;
      }

      requestAnimationFrame(loop);
    };
    loop();

    // Enlarge glass cursor over images
    document.querySelectorAll('.split-img, .project-visual').forEach(el => {
      el.addEventListener('mouseenter', () => cursorGlass.classList.add('active'));
      el.addEventListener('mouseleave', () => cursorGlass.classList.remove('active'));
    });
  }

  // Gooey Nav Blob
  const navLinks = document.querySelectorAll('.nav-item');
  const blob = document.querySelector('.nav-blob');
  
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', (e) => {
      const rect = e.target.getBoundingClientRect();
      const parentRect = e.target.parentElement.getBoundingClientRect();
      blob.style.transform = `translateX(${rect.left - parentRect.left - 10}px)`;
      blob.style.width = `${rect.width + 20}px`;
    });
  });
  const navContainer = document.querySelector('.nav-links');
  if(navContainer) {
    navContainer.addEventListener('mouseleave', () => {
      blob.style.width = `0px`;
    });
  }

  // Text Scramble Effect
  class Scrambler {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#_';
      this.originalText = el.getAttribute('data-text') || el.innerText;
    }
    scramble() {
      let iteration = 0;
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.el.innerText = this.originalText.split('').map((char, index) => {
          if(index < iteration) return char;
          return this.chars[Math.floor(Math.random() * this.chars.length)];
        }).join('');
        if(iteration >= this.originalText.length) clearInterval(this.interval);
        iteration += 1 / 3;
      }, 30);
    }
  }

  const scrambleEls = document.querySelectorAll('.scramble');
  const scramblers = Array.from(scrambleEls).map(el => new Scrambler(el));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = Array.from(scrambleEls).indexOf(entry.target);
        if(scramblers[index]) scramblers[index].scramble();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  scrambleEls.forEach(el => observer.observe(el));

  // Sticky Stacking Projects Scaling
  const stickyPanels = document.querySelectorAll('.sticky-panel');
  window.addEventListener('scroll', () => {
    if(!isDesktop) return;
    
    stickyPanels.forEach((panel, index) => {
      const rect = panel.getBoundingClientRect();
      // If panel reaches the top sticky point
      if (rect.top <= window.innerHeight * 0.15) {
        // Calculate how deep we scrolled past it
        const scrollPast = (window.innerHeight * 0.15) - rect.top;
        // Scale down slightly as it goes up
        const scale = Math.max(0.9, 1 - (scrollPast * 0.0005));
        const opacity = Math.max(0.5, 1 - (scrollPast * 0.001));
        
        // Only apply to the inner panel
        const inner = panel.querySelector('.project-panel');
        if(inner) {
          inner.style.transform = `scale(${scale})`;
          inner.style.opacity = opacity;
        }
      } else {
        const inner = panel.querySelector('.project-panel');
        if(inner) {
          inner.style.transform = `scale(1)`;
          inner.style.opacity = 1;
        }
      }
    });
  });

  // Basic Canvas logic for Project Visuals (minimalist data lines)
  const vizCanvases = document.querySelectorAll('.viz-canvas');
  vizCanvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    
    let time = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#DA1A35'; // Crimson
      ctx.lineWidth = 2;
      ctx.beginPath();
      for(let i=0; i<canvas.width; i+=10) {
        const y = canvas.height/2 + Math.sin(i*0.01 + time)*50;
        if(i===0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      time += 0.05;
      requestAnimationFrame(draw);
    }
    draw();
  });

  // Copy Email
  const copyBtn = document.getElementById('copy');
  if(copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('ddhairyadesai@gmail.com').then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy Email', 2000);
      });
    });
  }
});
