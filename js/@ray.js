function addListener(e,l){if(window.addEventListener){
window.addEventListener(e,l,false)}else{
window.attachEvent('on' + e, l)}}
addListener('DOMContentLoaded',
    function() {
        require('ray.main')
    }
);
