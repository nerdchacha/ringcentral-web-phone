!function(t){"use strict";var a=function(a){this.element=t(a)};function e(e){return this.each((function(){var n=t(this),i=n.data("bs.tab");i||n.data("bs.tab",i=new a(this)),"string"==typeof e&&i[e]()}))}a.VERSION="3.4.1",a.TRANSITION_DURATION=150,a.prototype.show=function(){var a=this.element,e=a.closest("ul:not(.dropdown-menu)"),n=a.data("target");if(n||(n=(n=a.attr("href"))&&n.replace(/.*(?=#[^\s]*$)/,"")),!a.parent("li").hasClass("active")){var i=e.find(".active:last a"),r=t.Event("hide.bs.tab",{relatedTarget:a[0]}),s=t.Event("show.bs.tab",{relatedTarget:i[0]});if(i.trigger(r),a.trigger(s),!s.isDefaultPrevented()&&!r.isDefaultPrevented()){var d=t(document).find(n);this.activate(a.closest("li"),e),this.activate(d,d.parent(),(function(){i.trigger({type:"hidden.bs.tab",relatedTarget:a[0]}),a.trigger({type:"shown.bs.tab",relatedTarget:i[0]})}))}}},a.prototype.activate=function(e,n,i){var r=n.find("> .active"),s=i&&t.support.transition&&(r.length&&r.hasClass("fade")||!!n.find("> .fade").length);function d(){r.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),e.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),s?(e[0].offsetWidth,e.addClass("in")):e.removeClass("fade"),e.parent(".dropdown-menu").length&&e.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),i&&i()}r.length&&s?r.one("bsTransitionEnd",d).emulateTransitionEnd(a.TRANSITION_DURATION):d(),r.removeClass("in")};var n=t.fn.tab;t.fn.tab=e,t.fn.tab.Constructor=a,t.fn.tab.noConflict=function(){return t.fn.tab=n,this};var i=function(a){a.preventDefault(),e.call(t(this),"show")};t(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',i).on("click.bs.tab.data-api",'[data-toggle="pill"]',i)}(jQuery);