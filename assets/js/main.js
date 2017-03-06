/**
 * Created by wembleyleach on 3/4/17.
 */
var ready = function (fn) {
    if (document.readyState != 'loading') {
        fn();
    }  else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};

ready(vanilla.init);