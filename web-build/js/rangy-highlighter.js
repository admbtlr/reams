!function(e,t){"function"==typeof define&&define.amd?define(["./rangy-core"],e):"undefined"!=typeof module&&"object"==typeof exports?module.exports=e(require("rangy")):e(t.rangy)}((function(e){return e.createModule("Highlighter",["ClassApplier"],(function(e,t){var n=e.dom,r=n.arrayContains,i=n.getBody,a=e.util.createOptions,s=e.util.forEach,h=1;function o(e,t){return e.characterRange.start-t.characterRange.start}function c(e,t){return t?e.getElementById(t):i(e)}var g={};function l(e,t){this.type=e,this.converterCreator=t}function u(e,t){g[e]=new l(e,t)}function p(e){var t=g[e];if(t instanceof l)return t.create();throw new Error("Highlighter type '"+e+"' is not valid")}function d(e,t){this.start=e,this.end=t}l.prototype.create=function(){var e=this.converterCreator();return e.type=this.type,e},e.registerHighlighterType=u,d.prototype={intersects:function(e){return this.start<e.end&&this.end>e.start},isContiguousWith:function(e){return this.start==e.end||this.end==e.start},union:function(e){return new d(Math.min(this.start,e.start),Math.max(this.end,e.end))},intersection:function(e){return new d(Math.max(this.start,e.start),Math.min(this.end,e.end))},getComplements:function(e){var t=[];if(this.start>=e.start){if(this.end<=e.end)return[];t.push(new d(e.end,this.end))}else t.push(new d(this.start,Math.min(this.end,e.start))),this.end>e.end&&t.push(new d(e.end,this.end));return t},toString:function(){return"[CharacterRange("+this.start+", "+this.end+")]"}},d.fromCharacterRange=function(e){return new d(e.start,e.end)};var f={rangeToCharacterRange:function(e,t){var n=e.getBookmark(t);return new d(n.start,n.end)},characterRangeToRange:function(t,n,r){var i=e.createRange(t);return i.moveToBookmark({start:n.start,end:n.end,containerNode:r}),i},serializeSelection:function(e,t){for(var n=e.getAllRanges(),r=[],i=1==n.length&&e.isBackward(),a=0,s=n.length;a<s;++a)r[a]={characterRange:this.rangeToCharacterRange(n[a],t),backward:i};return r},restoreSelection:function(e,t,n){e.removeAllRanges();for(var r,i,a=e.win.document,s=0,h=t.length;s<h;++s)(i=t[s]).characterRange,r=this.characterRangeToRange(a,i.characterRange,n),e.addRange(r,i.backward)}};function R(e,t,n,r,i,a){i?(this.id=i,h=Math.max(h,i+1)):this.id=h++,this.characterRange=t,this.doc=e,this.classApplier=n,this.converter=r,this.containerElementId=a||null,this.applied=!1}function v(e,t){t=t||"textContent",this.doc=e||document,this.classAppliers={},this.highlights=[],this.converter=p(t)}u("textContent",(function(){return f})),u("TextRange",function(){var t;return function(){if(!t){var n=e.modules.TextRange;if(!n)throw new Error("TextRange module is missing.");if(!n.supported)throw new Error("TextRange module is present but not supported.");t={rangeToCharacterRange:function(e,t){return d.fromCharacterRange(e.toCharacterRange(t))},characterRangeToRange:function(t,n,r){var i=e.createRange(t);return i.selectCharacters(r,n.start,n.end),i},serializeSelection:function(e,t){return e.saveCharacterRanges(t)},restoreSelection:function(e,t,n){e.restoreCharacterRanges(n,t)}}}return t}}()),R.prototype={getContainerElement:function(){return c(this.doc,this.containerElementId)},getRange:function(){return this.converter.characterRangeToRange(this.doc,this.characterRange,this.getContainerElement())},fromRange:function(e){this.characterRange=this.converter.rangeToCharacterRange(e,this.getContainerElement())},getText:function(){return this.getRange().toString()},containsElement:function(e){return this.getRange().containsNodeContents(e.firstChild)},unapply:function(){this.classApplier.undoToRange(this.getRange()),this.applied=!1},apply:function(){this.classApplier.applyToRange(this.getRange()),this.applied=!0},getHighlightElements:function(){return this.classApplier.getElementsWithClassIntersectingRange(this.getRange())},toString:function(){return"[Highlight(ID: "+this.id+", class: "+this.classApplier.className+", character range: "+this.characterRange.start+" - "+this.characterRange.end+")]"}},v.prototype={addClassApplier:function(e){this.classAppliers[e.className]=e},getHighlightForElement:function(e){for(var t=this.highlights,n=0,r=t.length;n<r;++n)if(t[n].containsElement(e))return t[n];return null},removeHighlights:function(e){for(var t,n=0,i=this.highlights.length;n<i;++n)t=this.highlights[n],r(e,t)&&(t.unapply(),this.highlights.splice(n--,1))},removeAllHighlights:function(){this.removeHighlights(this.highlights)},getIntersectingHighlights:function(e){var t=[],n=this.highlights;return s(e,(function(e){s(n,(function(n){e.intersectsRange(n.getRange())&&!r(t,n)&&t.push(n)}))})),t},highlightCharacterRanges:function(t,n,r){var i,h,o,c,g,l,u,p,f,v,m,C,w=this.highlights,y=this.converter,E=this.doc,T=[],x=t?this.classAppliers[t]:null,A=(r=a(r,{containerElementId:null,exclusive:!0})).containerElementId,H=r.exclusive;for(A&&(c=this.doc.getElementById(A))&&((g=e.createRange(this.doc)).selectNodeContents(c),l=new d(0,g.toString().length)),i=0,h=n.length;i<h;++i)if(u=n[i],m=[],l&&(u=u.intersection(l)),u.start!=u.end){for(o=0;o<w.length;++o)f=!1,A==w[o].containerElementId&&(p=w[o].characterRange,C=!(v=x==w[o].classApplier)&&H,(p.intersects(u)||p.isContiguousWith(u))&&(v||C)&&(C&&s(p.getComplements(u),(function(e){m.push(new R(E,e,w[o].classApplier,y,null,A))})),f=!0,v&&(u=p.union(u)))),f?(T.push(w[o]),w[o]=new R(E,p.union(u),x,y,null,A)):m.push(w[o]);x&&m.push(new R(E,u,x,y,null,A)),this.highlights=w=m}s(T,(function(e){e.unapply()}));var I=[];return s(w,(function(e){e.applied||(e.apply(),I.push(e))})),I},highlightRanges:function(t,n,r){var h,o=[],c=this.converter,g=(r=a(r,{containerElement:null,exclusive:!0})).containerElement,l=g?g.id:null;return g&&(h=e.createRange(g)).selectNodeContents(g),s(n,(function(e){var t=g?h.intersection(e):e;o.push(c.rangeToCharacterRange(t,g||i(e.getDocument())))})),this.highlightCharacterRanges(t,o,{containerElementId:l,exclusive:r.exclusive})},highlightSelection:function(t,n){var r=this.converter,i=!!t&&this.classAppliers[t],h=(n=a(n,{containerElementId:null,exclusive:!0})).containerElementId,o=n.exclusive,g=n.selection||e.getSelection(this.doc),l=c(g.win.document,h);if(!i&&!1!==t)throw new Error("No class applier found for class '"+t+"'");var u=r.serializeSelection(g,l),p=[];s(u,(function(e){p.push(d.fromCharacterRange(e.characterRange))}));var f=this.highlightCharacterRanges(t,p,{containerElementId:h,exclusive:o});return r.restoreSelection(g,u,l),f},unhighlightSelection:function(t){t=t||e.getSelection(this.doc);var n=this.getIntersectingHighlights(t.getAllRanges());return this.removeHighlights(n),t.removeAllRanges(),n},getHighlightsInSelection:function(t){return t=t||e.getSelection(this.doc),this.getIntersectingHighlights(t.getAllRanges())},selectionOverlapsHighlight:function(e){return this.getHighlightsInSelection(e).length>0},serialize:function(e){var t,n,r,i,h=this,c=h.highlights;return c.sort(o),t=(e=a(e,{serializeHighlightText:!1,type:h.converter.type})).type,(r=t!=h.converter.type)&&(i=p(t)),n=["type:"+t],s(c,(function(t){var a,s=t.characterRange;r&&(a=t.getContainerElement(),s=i.rangeToCharacterRange(h.converter.characterRangeToRange(h.doc,s,a),a));var o=[s.start,s.end,t.id,t.classApplier.className,t.containerElementId];e.serializeHighlightText&&o.push(t.getText()),n.push(o.join("$"))})),n.join("|")},deserialize:function(e){var t,n,r,i,a,s,h,o,g=e.split("|"),l=[],u=g[0],f=!1;if(!u||!(t=/^type:(\w+)$/.exec(u)))throw new Error("Serialized highlights are invalid.");(n=t[1])!=this.converter.type&&(r=p(n),f=!0),g.shift();for(var v,m=g.length;m-- >0;){if(s=new d(+(v=g[m].split("$"))[0],+v[1]),h=v[4]||null,f&&(o=c(this.doc,h),s=this.converter.rangeToCharacterRange(r.characterRangeToRange(this.doc,s,o),o)),!(i=this.classAppliers[v[3]]))throw new Error("No class applier found for class '"+v[3]+"'");(a=new R(this.doc,s,i,this.converter,parseInt(v[2]),h)).apply(),l.push(a)}this.highlights=l}},e.Highlighter=v,e.createHighlighter=function(e,t){return new v(e,t)}})),e}),this);