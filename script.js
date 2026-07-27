// ============================================================
// MARS AVATAR PROJECT — SCRIPT
// Production Version
// ------------------------------------------------------------
// 1. Mobile navigation
// 2. Smooth scrolling
// 3. Scroll reveal
// 4. Active navigation
// 5. Lazy images
// 6. Accessibility improvements
// ============================================================

(() => {
"use strict";

/* -----------------------------------------------------------
   Elements
----------------------------------------------------------- */

const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
const navAnchors = document.querySelectorAll("#nav-links a");
const sections = document.querySelectorAll("main .section");
const watched = document.querySelectorAll("header#home, main .section");

/* -----------------------------------------------------------
   Accessibility
----------------------------------------------------------- */

const prefersReducedMotion = window.matchMedia(
"(prefers-reduced-motion: reduce)"
).matches;

/* -----------------------------------------------------------
   Mobile Navigation
----------------------------------------------------------- */

if (navToggle && navLinks) {

function closeMenu() {
navLinks.classList.remove("open");
navToggle.setAttribute("aria-expanded","false");
}

function openMenu() {
navLinks.classList.add("open");
navToggle.setAttribute("aria-expanded","true");
}

navToggle.addEventListener("click", () => {

const open = navLinks.classList.contains("open");

open ? closeMenu() : openMenu();

});

navLinks.querySelectorAll("a").forEach(link => {

link.addEventListener("click", closeMenu);

});

document.addEventListener("click",(e)=>{

if(
navLinks.classList.contains("open") &&
!navLinks.contains(e.target) &&
!navToggle.contains(e.target)
){
closeMenu();
}

});

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){
closeMenu();
}

});

window.addEventListener("resize",()=>{

if(window.innerWidth>900){
closeMenu();
}

});

}

/* -----------------------------------------------------------
   Smooth Scroll
----------------------------------------------------------- */

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

anchor.addEventListener("click",(e)=>{

const target=document.querySelector(anchor.getAttribute("href"));

if(!target) return;

e.preventDefault();

const offset=80;

window.scrollTo({

top:target.offsetTop-offset,

behavior:prefersReducedMotion ? "auto":"smooth"

});

});

});

/* -----------------------------------------------------------
   Scroll Reveal
----------------------------------------------------------- */

sections.forEach(section=>{

section.classList.add("reveal");

});

if(prefersReducedMotion){

sections.forEach(section=>{

section.classList.add("visible");

});

}else{

const revealObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("visible");

revealObserver.unobserve(entry.target);

}

});

},{
threshold:0.12
});

sections.forEach(section=>{

revealObserver.observe(section);

});

}

/* -----------------------------------------------------------
   Active Navigation
----------------------------------------------------------- */

function setActive(id){

navAnchors.forEach(link=>{

link.classList.toggle(
"active",
link.getAttribute("href")==="#" + id
);

});

}

const visibleSections=new Map();

const navObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

visibleSections.set(entry.target.id,entry.intersectionRatio);

}else{

visibleSections.delete(entry.target.id);

}

});

let current=null;

let highest=0;

visibleSections.forEach((ratio,id)=>{

if(ratio>highest){

highest=ratio;
current=id;

}

});

if(current){
setActive(current);
}

},{
rootMargin:"-45% 0px -45% 0px",
threshold:[0,0.25,0.5,0.75,1]
});

watched.forEach(section=>{

navObserver.observe(section);

});

/* -----------------------------------------------------------
   Lazy Images
----------------------------------------------------------- */

document.querySelectorAll("img").forEach(img=>{

img.loading="lazy";
img.decoding="async";

});

})();
