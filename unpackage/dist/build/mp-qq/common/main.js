(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["common/main"],{"198e":function(e,t,n){"use strict";n.r(t);var o=n("7102");for(var r in o)"default"!==r&&function(e){n.d(t,e,(function(){return o[e]}))}(r);n("3f86");var c,a,u,l,i=n("f0c5"),s=Object(i["a"])(o["default"],c,a,!1,null,null,null,!1,u,l);t["default"]=s.exports},"3f86":function(e,t,n){"use strict";var o=n("5e7e"),r=n.n(o);r.a},4979:function(e,t,n){"use strict";(function(e){n("c7c7");var t=r(n("66fd")),o=r(n("198e"));function r(e){return e&&e.__esModule?e:{default:e}}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){u(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function u(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}t.default.config.productionTip=!1,o.default.mpType="app";var l=new t.default(a({},o.default));e(l).$mount()}).call(this,n("a821")["createApp"])},"4c26":function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n={onLaunch:function(){console.log("App Launch");var t=e.getStorageSync("settings_key");console.log(t),this.globalData.settings=t||{defaultScoreQuery:!0,useVPN:!1,maxScore:!0,scoreQuerySemester:"全部",beginTime:(new Date).getTime()};var n=e.getStorageSync("course_key");console.log(n),this.globalData.course=n||{studentInfo:{name:"",number:""},remark:"",course:[],years:[]};var o=e.getStorageSync("score_key");console.log(o),o&&(this.globalData.score=o)},onShow:function(){console.log("App Show")},onHide:function(){console.log("App Hide")},globalData:{host:"https://mdreamfever.com:9008",settings:{},course:[],score:[]}};t.default=n}).call(this,n("a821")["default"])},"5e7e":function(e,t,n){},7102:function(e,t,n){"use strict";n.r(t);var o=n("4c26"),r=n.n(o);for(var c in o)"default"!==c&&function(e){n.d(t,e,(function(){return o[e]}))}(c);t["default"]=r.a}},[["4979","common/runtime","common/vendor"]]]);