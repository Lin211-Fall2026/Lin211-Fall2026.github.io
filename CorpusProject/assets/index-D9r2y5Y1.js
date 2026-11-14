(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const u of document.querySelectorAll('link[rel="modulepreload"]'))l(u);new MutationObserver(u=>{for(const h of u)if(h.type==="childList")for(const w of h.addedNodes)w.tagName==="LINK"&&w.rel==="modulepreload"&&l(w)}).observe(document,{childList:!0,subtree:!0});function i(u){const h={};return u.integrity&&(h.integrity=u.integrity),u.referrerPolicy&&(h.referrerPolicy=u.referrerPolicy),u.crossOrigin==="use-credentials"?h.credentials="include":u.crossOrigin==="anonymous"?h.credentials="omit":h.credentials="same-origin",h}function l(u){if(u.ep)return;u.ep=!0;const h=i(u);fetch(u.href,h)}})();function je(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var ke={exports:{}};/* @license
Papa Parse
v5.7.1
https://github.com/mholt/PapaParse
License: MIT
*/var ze=ke.exports,Ie;function We(){return Ie||(Ie=1,(function(s,a){((i,l)=>{s.exports=l()})(ze,function i(){var l=typeof self<"u"?self:typeof window<"u"?window:l!==void 0?l:{},u=!l.document&&!!l.postMessage,h=l.IS_PAPA_WORKER||!1,w={},f=0,c={};function o(t){return t.charCodeAt(0)===65279?t.slice(1):t}function d(t){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},(function(e){var n=ge(e);n.chunkSize=parseInt(n.chunkSize),e.step||e.chunk||(n.chunkSize=null),this._handle=new B(n),(this._handle.streamer=this)._config=n}).call(this,t),this.parseChunk=function(e,n){var y=parseInt(this._config.skipFirstNLines)||0;if(this.isFirstChunk&&0<y){let L=this._config.newline;L||(g=this._config.quoteChar||'"',L=this._handle.guessLineEndings(e,g)),e=[...e.split(L).slice(y)].join(L)}this.isFirstChunk&&D(this._config.beforeFirstChunk)&&(g=this._config.beforeFirstChunk(e))!==void 0&&(e=g),this.isFirstChunk=!1,this._halted=!1;var y=this._partialLine+e,g=(this._partialLine="",this._handle.parse(y,this._baseIndex,!this._finished));if(!this._handle.paused()&&!this._handle.aborted()){if(e=g.meta.cursor,y=(this._finished||(this._partialLine=y.substring(e-this._baseIndex),this._baseIndex=e),g&&g.data&&(this._rowCount+=g.data.length),this._finished||this._config.preview&&this._rowCount>=this._config.preview),h)l.postMessage({results:g,workerId:c.WORKER_ID,finished:y});else if(D(this._config.chunk)&&!n){if(this._config.chunk(g,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);this._completeResults=g=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(g.data),this._completeResults.errors=this._completeResults.errors.concat(g.errors),this._completeResults.meta=g.meta),this._completed||!y||!D(this._config.complete)||g&&g.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),y||g&&g.meta.paused||this._nextChunk(),g}this._halted=!0},this._sendError=function(e){D(this._config.error)?this._config.error(e):h&&this._config.error&&l.postMessage({workerId:c.WORKER_ID,error:e,finished:!1})}}function p(t){var e;(t=t||{}).chunkSize||(t.chunkSize=c.RemoteChunkSize),d.call(this,t),this._nextChunk=u?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(n){this._input=n,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(e=new XMLHttpRequest,this._config.withCredentials&&(e.withCredentials=this._config.withCredentials),u||(e.onload=he(this._chunkLoaded,this),e.onerror=he(this._chunkError,this)),e.ontimeout=he(this._chunkTimeout,this),e.open(this._config.downloadRequestBody?"POST":"GET",this._input,!u),this._config.downloadTimeout&&!u&&(e.timeout=this._config.downloadTimeout),this._config.downloadRequestHeaders){var n,y=this._config.downloadRequestHeaders;for(n in y)e.setRequestHeader(n,y[n])}var g;this._config.chunkSize&&(g=this._start+this._config.chunkSize-1,e.setRequestHeader("Range","bytes="+this._start+"-"+g));try{e.send(this._config.downloadRequestBody)}catch(L){this._chunkError(L.message)}u&&e.status===0&&this._chunkError()}},this._chunkLoaded=function(){e.readyState===4&&(e.status<200||400<=e.status?this._chunkError():(this._start+=this._config.chunkSize||e.responseText.length,this._finished=!this._config.chunkSize||this._start>=(n=>(n=n.getResponseHeader("Content-Range"))!==null?parseInt(n.substring(n.lastIndexOf("/")+1)):-1)(e),this.parseChunk(e.responseText)))},this._chunkError=function(n){n=e.statusText||n,this._sendError(new Error(n))},this._chunkTimeout=function(){this._chunkError("Request timed out after "+this._config.downloadTimeout+"ms")}}function T(t){(t=t||{}).chunkSize||(t.chunkSize=c.LocalChunkSize),d.call(this,t);var e,n,y=typeof FileReader<"u";this.stream=function(g){this._input=g,n=g.slice||g.webkitSlice||g.mozSlice,y?((e=new FileReader).onload=he(this._chunkLoaded,this),e.onerror=he(this._chunkError,this)):e=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var g=this._input,L=(this._config.chunkSize&&(L=Math.min(this._start+this._config.chunkSize,this._input.size),g=n.call(g,this._start,L)),e.readAsText(g,this._config.encoding));y||this._chunkLoaded({target:{result:L}})},this._chunkLoaded=function(g){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(g.target.result)},this._chunkError=function(){this._sendError(e.error)}}function x(t){var e;d.call(this,t=t||{}),this.stream=function(n){return e=n,this._nextChunk()},this._nextChunk=function(){var n,y;if(!this._finished)return n=this._config.chunkSize,e=n?(y=e.substring(0,n),e.substring(n)):(y=e,""),this._finished=!e,this.parseChunk(y)}}function N(t){d.call(this,t=t||{});var e=[],n=!0,y=!1;this.pause=function(){d.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){d.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(g){this._input=g,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){y&&e.length===1&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),e.length?this.parseChunk(e.shift()):n=!0},this._streamData=he(function(g){try{e.push(typeof g=="string"?g:g.toString(this._config.encoding)),n&&(n=!1,this._checkIsFinished(),this.parseChunk(e.shift()))}catch(L){this._streamError(L)}},this),this._streamError=he(function(g){this._streamCleanUp(),this._sendError(g)},this),this._streamEnd=he(function(){this._streamCleanUp(),y=!0,this._streamData("")},this),this._streamCleanUp=he(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function B(t){var e,n,y,g,L=Math.pow(2,53),V=-L,oe=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,ie=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,A=this,X=0,v=0,J=!1,b=!1,k=[],m={data:[],errors:[],meta:{}};function H(E){return t.skipEmptyLines==="greedy"?E.join("").trim()==="":E.length===1&&E[0].length===0}function I(){if(m&&y&&(se("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+c.DefaultDelimiter+"'"),y=!1),t.skipEmptyLines&&(m.data=m.data.filter(function(P){return!H(P)})),j()){let P=function(K){k.push(K)};var _=P;if(m)if(Array.isArray(m.data[0])){for(var E=0;j()&&E<m.data.length;E++)m.data[E].forEach(P);m.data.splice(0,1)}else m.data.forEach(P)}function S(P,K){for(var Y=t.header?{}:[],C=0;C<P.length;C++){var $=C,G=P[C],G=((R,F)=>(z=>(t.dynamicTypingFunction&&t.dynamicTyping[z]===void 0&&(t.dynamicTyping[z]=t.dynamicTypingFunction(z)),(t.dynamicTyping[z]||t.dynamicTyping)===!0))(R)?F==="true"||F==="TRUE"||F!=="false"&&F!=="FALSE"&&((z=>{if(oe.test(z)&&(z=parseFloat(z),V<z&&z<L))return 1})(F)?parseFloat(F):ie.test(F)?new Date(F):F===""?null:F):F)($=t.header?C>=k.length?"__parsed_extra":k[C]:$,G=t.transform?t.transform(G,$):G);$==="__parsed_extra"?(Y[$]=Y[$]||[],Y[$].push(G)):Y[$]=G}return t.header&&(C>k.length?se("FieldMismatch","TooManyFields","Too many fields: expected "+k.length+" fields but parsed "+C,v+K):C<k.length&&se("FieldMismatch","TooFewFields","Too few fields: expected "+k.length+" fields but parsed "+C,v+K)),Y}var M;m&&(t.header||t.dynamicTyping||t.transform)&&(M=1,!m.data.length||Array.isArray(m.data[0])?(m.data=m.data.map(S),M=m.data.length):m.data=S(m.data,0),t.header&&m.meta&&(m.meta.fields=k),v+=M)}function j(){return t.header&&k.length===0}function se(E,S,M,_){E={type:E,code:S,message:M},_!==void 0&&(E.row=_),m.errors.push(E)}D(t.step)&&(g=t.step,t.step=function(E){m=E,j()?I():(I(),m.data.length!==0&&(X+=E.data.length,t.preview&&X>t.preview?n.abort():(m.data=m.data[0],g(m,A))))}),this.parse=function(E,S,M){var _=t.quoteChar||'"',_=(t.newline||(t.newline=this.guessLineEndings(E,_)),y=!1,t.delimiter?D(t.delimiter)&&(t.delimiter=t.delimiter(E),m.meta.delimiter=t.delimiter):((_=((P,K,Y,C,$)=>{var G,R,F,z;$=$||[",","	","|",";",c.RECORD_SEP,c.UNIT_SEP];for(var me=0;me<$.length;me++){for(var ce,ve=$[me],Q=0,le=0,W=0,ee=(F=void 0,new Z({comments:C,delimiter:ve,newline:K,preview:10}).parse(P)),pe=0;pe<ee.data.length;pe++)Y&&H(ee.data[pe])?W++:(ce=ee.data[pe].length,le+=ce,F===void 0?F=ce:0<ce&&(Q+=Math.abs(ce-F),F=ce));0<ee.data.length&&(le/=ee.data.length-W),1.99<le&&(R===void 0||Q<R||Q===R&&z<le)&&(R=Q,G=ve,z=le)}return{successful:!!(t.delimiter=G),bestDelimiter:G}})(E,t.newline,t.skipEmptyLines,t.comments,t.delimitersToGuess)).successful?t.delimiter=_.bestDelimiter:(y=!0,t.delimiter=c.DefaultDelimiter),m.meta.delimiter=t.delimiter),ge(t));return _.header=j(),t.preview&&t.header&&_.preview++,e=E,n=new Z(_),m=n.parse(e,S,M),I(),J?{meta:{paused:!0}}:m||{meta:{paused:!1}}},this.paused=function(){return J},this.pause=function(){J=!0,n.abort(),e=D(t.chunk)?"":e.substring(n.getCharIndex())},this.resume=function(){A.streamer._halted?(J=!1,A.streamer.parseChunk(e,!0)):setTimeout(A.resume,3)},this.aborted=function(){return b},this.abort=function(){b=!0,n.abort(),m.meta.aborted=!0,D(t.complete)&&t.complete(m),e=""},this.guessLineEndings=function(P,_){P=P.substring(0,1048576);var _=new RegExp(O(_)+"([^]*?)"+O(_),"gm"),M=(P=P.replace(_,"")).split("\r"),_=P.split(`
`),P=1<_.length&&_[0].length<M[0].length;if(M.length===1||P)return`
`;for(var K=0,Y=0;Y<M.length;Y++)M[Y][0]===`
`&&K++;return K>=M.length/2?`\r
`:"\r"}}function O(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Z(t){var e=(t=t||{}).delimiter,n=t.newline,y=t.comments,g=t.step,L=t.preview,V=t.fastMode,oe=null,ie=!1,A=t.quoteChar==null?'"':t.quoteChar,X=A;if(t.escapeChar!==void 0&&(X=t.escapeChar),(typeof e!="string"||-1<c.BAD_DELIMITERS.indexOf(e))&&(e=","),y===e)throw new Error("Comment character same as delimiter");y===!0?y="#":(typeof y!="string"||-1<c.BAD_DELIMITERS.indexOf(y))&&(y=!1),n!==`
`&&n!=="\r"&&n!==`\r
`&&(n=`
`);var v=0,J=!1;this.parse=function(b,k,m){if(typeof b!="string")throw new Error("Input must be a string");var H=b.length,I=e.length,j=n.length,se=y.length,E=D(g),S=[],M=[],_=[],P=v=0;if(!b)return Q();if(V||V!==!1&&b.indexOf(A)===-1){for(var K=b.split(n),Y=0;Y<K.length;Y++){if(_=K[Y],v+=_.length,Y!==K.length-1)v+=n.length;else if(m)return Q();if(!y||_.substring(0,se)!==y){if(E){if(S=[],z(_.split(e)),le(),J)return Q()}else z(_.split(e));if(L&&L<=Y)return S=S.slice(0,L),Q(!0)}}return Q()}for(var C=b.indexOf(e,v),$=b.indexOf(n,v),G=new RegExp(O(X)+O(A),"g"),R=b.indexOf(A,v);;)if(b[v]===A)for(R=v,v++;;){if((R=b.indexOf(A,R+1))===-1)return m||M.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:S.length,index:v}),ce();if(R===H-1)return ce(b.substring(v,R).replace(G,A));if(A===X&&b[R+1]===X)R++;else if(A===X||R===0||b[R-1]!==X){C!==-1&&C<R+1&&(C=b.indexOf(e,R+1));var F=me(($=$!==-1&&$<R+1?b.indexOf(n,R+1):$)===-1?C:Math.min(C,$));if(b.substr(R+1+F,I)===e){_.push(b.substring(v,R).replace(G,A)),b[v=R+1+F+I]!==A&&(R=b.indexOf(A,v)),C!==-1&&C<v&&(C=b.indexOf(e,v)),$!==-1&&$<v&&($=b.indexOf(n,v));break}if(F=me($),b.substring(R+1+F,R+1+F+j)===n){if(_.push(b.substring(v,R).replace(G,A)),ve(R+1+F+j),C!==-1&&C<v&&(C=b.indexOf(e,v)),R=b.indexOf(A,v),E&&(le(),J))return Q();if(L&&S.length>=L)return Q(!0);break}M.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:S.length,index:v}),R++}}else if(y&&_.length===0&&b.substring(v,v+se)===y){if($===-1)return Q();v=$+j,$=b.indexOf(n,v),C!==-1&&C<v&&(C=b.indexOf(e,v))}else if(C!==-1&&(C<$||$===-1))_.push(b.substring(v,C)),v=C+I,C=b.indexOf(e,v);else{if($===-1)break;if(_.push(b.substring(v,$)),ve($+j),E&&(le(),J))return Q();if(L&&S.length>=L)return Q(!0)}return ce();function z(W){S.push(W),P=v}function me(W){var ee=0;return ee=W!==-1&&(W=b.substring(R+1,W))&&W.trim()===""?W.length:ee}function ce(W){return m||(W===void 0&&(W=b.substring(v)),_.push(W),v=H,z(_),E&&le()),Q()}function ve(W){v=W,z(_),_=[],$=b.indexOf(n,v)}function Q(W){if(t.header&&!k&&S.length&&!ie){var ee=S[0],pe=Object.create(null),Ee=new Set(ee);let qe=!1;for(let ye=0;ye<ee.length;ye++){let de=o(ee[ye]);if(pe[de=D(t.transformHeader)?t.transformHeader(de,ye):de]){let be,Ae=pe[de];for(;be=de+"_"+Ae,Ae++,Ee.has(be););Ee.add(be),ee[ye]=be,pe[de]++,qe=!0,(oe=oe===null?{}:oe)[be]=de}else pe[de]=1,ee[ye]=de;Ee.add(de)}qe&&console.warn("Duplicate headers found and renamed."),ie=!0}return{data:S,errors:M,meta:{delimiter:e,linebreak:n,aborted:J,truncated:!!W,cursor:P+(k||0),renamedHeaders:oe}}}function le(){g(Q()),S=[],M=[]}},this.abort=function(){J=!0},this.getCharIndex=function(){return v}}function ue(t){var e=t.data,n=w[e.workerId],y=!1;if(e.error)n.userError(e.error,e.file);else if(e.results&&e.results.data){var g={abort:function(){y=!0,ne(e.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:ae,resume:ae};if(D(n.userStep)){for(var L=0;L<e.results.data.length&&(n.userStep({data:e.results.data[L],errors:e.results.errors,meta:e.results.meta},g),!y);L++);delete e.results}else D(n.userChunk)&&(n.userChunk(e.results,g,e.file),delete e.results)}e.finished&&!y&&ne(e.workerId,e.results)}function ne(t,e){var n=w[t];D(n.userComplete)&&n.userComplete(e),n.terminate(),delete w[t]}function ae(){throw new Error("Not implemented.")}function ge(t){if(typeof t!="object"||t===null)return t;var e,n=Array.isArray(t)?[]:{};for(e in t)n[e]=ge(t[e]);return n}function he(t,e){return function(){t.apply(e,arguments)}}function D(t){return typeof t=="function"}return c.parse=function(t,e){var n=(e=e||{}).dynamicTyping||!1;if(D(n)&&(e.dynamicTypingFunction=n,n={}),e.dynamicTyping=n,e.transform=!!D(e.transform)&&e.transform,e.downloadTimeout!==void 0){var n=parseInt(e.downloadTimeout);if(isNaN(n))throw new Error("Config downloadTimeout value ("+e.downloadTimeout+") not parsable by parseInt(val).");e.downloadTimeout=n}if(!e.worker||!c.WORKERS_SUPPORTED)return n=null,c.NODE_STREAM_INPUT,typeof t=="string"?(t=o(t),n=new(e.download?p:x)(e)):t.readable===!0&&D(t.read)&&D(t.on)?n=new N(e):(l.File&&t instanceof File||t instanceof Object)&&(n=new T(e)),n.stream(t);(n=(()=>{var y;return!!c.WORKERS_SUPPORTED&&(y=(()=>{var g=l.URL||l.webkitURL||null,L=i.toString();return c.BLOB_URL||(c.BLOB_URL=g.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",L,")();"],{type:"text/javascript"})))})(),(y=new l.Worker(y)).onmessage=ue,y.id=f++,w[y.id]=y)})()).userStep=e.step,n.userChunk=e.chunk,n.userComplete=e.complete,n.userError=e.error,e.step=D(e.step),e.chunk=D(e.chunk),e.complete=D(e.complete),e.error=D(e.error),delete e.worker,n.postMessage({input:t,config:e,workerId:n.id})},c.unparse=function(t,e){var n=!1,y=!0,g=",",L=`\r
`,V='"',oe=V+V,ie=!1,A=null,X=!1,v=((()=>{if(typeof e=="object"){if(typeof e.delimiter!="string"||c.BAD_DELIMITERS.filter(function(k){return e.delimiter.indexOf(k)!==-1}).length||(g=e.delimiter),typeof e.quotes!="boolean"&&typeof e.quotes!="function"&&!Array.isArray(e.quotes)||(n=e.quotes),typeof e.skipEmptyLines!="boolean"&&typeof e.skipEmptyLines!="string"||(ie=e.skipEmptyLines),typeof e.newline=="string"&&(L=e.newline),typeof e.quoteChar=="string"&&(V=e.quoteChar,oe=V+V),typeof e.header=="boolean"&&(y=e.header),Array.isArray(e.columns)){if(e.columns.length===0)throw new Error("Option columns is empty");A=e.columns}e.escapeChar!==void 0&&(oe=e.escapeChar+V),e.escapeFormulae instanceof RegExp?X=e.escapeFormulae:typeof e.escapeFormulae=="boolean"&&e.escapeFormulae&&(X=/^[=+\-@\t\r].*$/)}})(),new RegExp(O(V),"g"));if(typeof t=="string"&&(t=JSON.parse(t)),Array.isArray(t)){if(!t.length)return J(A,t,ie);if(Array.isArray(t[0]))return J(null,t,ie);if(typeof t[0]=="object")return J(A||Object.keys(t[0]),t,ie)}else if(typeof t=="object")return typeof t.data=="string"&&(t.data=JSON.parse(t.data)),Array.isArray(t.data)&&(t.fields||(t.fields=t.meta&&t.meta.fields||A),t.fields||(t.fields=Array.isArray(t.data[0])?t.fields:typeof t.data[0]=="object"?Object.keys(t.data[0]):[]),Array.isArray(t.data[0])||typeof t.data[0]=="object"||(t.data=[t.data])),J(t.fields||[],t.data||[],ie);throw new Error("Unable to serialize unrecognized input");function J(k,m,H){var I="",j=(typeof k=="string"&&(k=JSON.parse(k)),typeof m=="string"&&(m=JSON.parse(m)),Array.isArray(k)&&0<k.length),se=!Array.isArray(m[0]);if(j&&y){for(var E=0;E<k.length;E++)0<E&&(I+=g),I+=b(k[E],E);0<m.length&&(I+=L)}for(var S=0;S<m.length;S++){var M=(j?k:m[S]).length,_=!1,P=j?Object.keys(m[S]).length===0:m[S].length===0;if(H&&!j&&(_=H==="greedy"?m[S].join("").trim()==="":m[S].length===1&&(m[S][0]==null||m[S][0].length===0)),H==="greedy"&&j){for(var K=[],Y=0;Y<M;Y++){var C=se?k[Y]:Y;K.push(m[S][C])}_=K.join("").trim()===""}if(!_){for(var $=0;$<M;$++){0<$&&!P&&(I+=g);var G=j&&se?k[$]:$;I+=b(m[S][G],$)}S<m.length-1&&(!H||0<M&&!P)&&(I+=L)}}return I}function b(k,m){var H,I,j;return k==null?"":k.constructor===Date?isNaN(k.getTime())?"":k.toISOString():(j=!1,H=k.toString(),X&&typeof k!="number"&&typeof k!="bigint"&&typeof k!="boolean"&&X.test(H)&&(k=H="'"+H,j=!0),I=H.replace(v,oe),(j=j||n===!0||typeof n=="function"&&n(k,m)||Array.isArray(n)&&n[m]||((se,E)=>{for(var S=0;S<E.length;S++)if(-1<se.indexOf(E[S]))return!0;return!1})(I,c.BAD_DELIMITERS)||-1<I.indexOf(g)||-1<H.indexOf(V)||I.charAt(0)===" "||I.charAt(I.length-1)===" ")?V+I+V:I)}},c.RECORD_SEP="",c.UNIT_SEP="",c.BYTE_ORDER_MARK="\uFEFF",c.BAD_DELIMITERS=["\r",`
`,'"',c.BYTE_ORDER_MARK],c.WORKERS_SUPPORTED=!u&&!!l.Worker,c.NODE_STREAM_INPUT=1,c.LocalChunkSize=10485760,c.RemoteChunkSize=5242880,c.DefaultDelimiter=",",c.Parser=Z,c.ParserHandle=B,c.NetworkStreamer=p,c.FileStreamer=T,c.StringStreamer=x,c.ReadableStreamStreamer=N,h&&(l.onmessage=function(t){t=t.data,c.WORKER_ID===void 0&&t&&(c.WORKER_ID=t.workerId),typeof t.input=="string"?l.postMessage({workerId:c.WORKER_ID,results:c.parse(t.input,t.config),finished:!0}):(l.File&&t.input instanceof File||t.input instanceof Object)&&(t=c.parse(t.input,t.config))&&l.postMessage({workerId:c.WORKER_ID,results:t,finished:!0})}),(p.prototype=Object.create(d.prototype)).constructor=p,(T.prototype=Object.create(d.prototype)).constructor=T,(x.prototype=Object.create(x.prototype)).constructor=x,(N.prototype=Object.create(d.prototype)).constructor=N,c})})(ke)),ke.exports}var Ue=We();const Be=je(Ue),He="/CorpusProject/assets/country-corpus-CsTyhV6k.csv",we=1944,$e=2024,fe=20,Ce=50,Le=1e3,Qe=/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu,Me=new Set(`a about above after again against all am an and any are as at
  aren't be because been before being below between both but by can
  could did do does each few for from further go had has have having
  hadn't hasn't haven't he he'd he'll her here hers herself him
  himself his how he's i i'd i'll i'm i've if in into is it it'd
  it'll it's its itself just me more most my myself no nor not of
  off on once only or other our ours ourselves out over same she
  she'd she'll she's should so some such than that the their theirs
  them themselves then there these that's there's they they'd they'll
  they're they've this those through to too under until up very was
  wasn't we we'd we'll we're we've were weren't what what's when
  where which while who who's whom why will won't with would wouldn't
  you you'd you'll you're you've your yours yourself yourselves
  can't couldn't didn't doesn't don't`.split(/\s+/)),r={songs:[],tab:"overview",fromYear:we,toYear:$e,concordanceQuery:"",wholeWord:!0,compareFirst:"ain't",compareSecond:"isn't",compareError:"",ngramSize:1,songQuery:"",songPage:0,artistQuery:"",artistPage:0,expandedArtistId:null,kwicPage:0,expandedSongId:null},q=document.querySelector("#app");function xe(s){return(s.toLocaleLowerCase().match(Qe)??[]).map(a=>a.replaceAll("’","'"))}function Ke(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Ge(s){const a=Be.parse(s,{header:!0,skipEmptyLines:"greedy"});if(a.errors.length)throw new Error(`Could not read the CSV: ${a.errors[0].message}`);const i=[];let l=0;for(const u of a.data){const h=(u.Year??"").trim(),w=Number(h),f={id:(u.ID??"").trim(),year:w,chartPosition:(u["Chart Position"]??"").trim(),title:(u["Song Title"]??"").trim(),artist:(u["Artist or Group"]??"").trim(),lyrics:(u.Lyrics??"").trim()};!Number.isInteger(w)||w<we||w>$e?l+=1:i.push(f)}if(l>0)throw new Error(`The CSV has ${l} row(s) with years outside 1944–2024.`);if(i.length===0)throw new Error("The CSV loaded, but no songs have years from 1944 to 2024.");return i}function Ye(){return r.songs.filter(s=>s.year>=r.fromYear&&s.year<=r.toYear)}function Ne(s){return s.trim().replace(/\s+/g," ").toLocaleLowerCase()}function Re(s){r.tab=s,r.kwicPage=0,r.songPage=0,r.artistPage=0,te()}function te(){const s=Ye();q.innerHTML=`
    <header class="site-header">
      <nav class="site-navbar" aria-label="Course site">
        <a class="site-brand" href="../">Lin211 Fall 2026</a>
        <button class="site-menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" aria-label="Toggle navigation">
          <span class="menu-icon" aria-hidden="true"><i></i><i></i><i></i></span>
        </button>
        <div class="site-links" id="site-navigation">
          <a href="../">Home</a>
          <a href="../syllabus/Lin211-Fall2026-Syllabus.html">Syllabus</a>
          <a href="./" aria-current="page">Corpus Project</a>
          <a href="../slides/">Slides</a>
        </div>
      </nav>
    </header>

    <main id="top" class="site-content">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">LIN 211 · CORPUS PROJECT</p>
          <h1>Country music lyrics corpus</h1>
          <p class="hero-description">Explore charting country songs from 1944 to 2024. Follow words across time, find them in context, and browse the artists & lyrics.</p>
          <button class="text-link" data-tab="concordance">Start with a word <span aria-hidden="true">↗</span></button>
        </div>
      </section>

      <section class="data-ribbon" aria-label="Corpus overview">
        <div class="ribbon-intro"><span class="small-caps">THE COLLECTION</span><span>Charting songs, selected years, collected by students in Lin 211, Fall 2026</span></div>
        <div class="stat"><strong>${r.songs.length}</strong><span>songs</span></div>
        <div class="stat"><strong>${new Set(r.songs.map(a=>Ne(a.artist))).size}</strong><span>artists &amp; groups</span></div>
        <div class="stat"><strong>${new Set(r.songs.map(a=>Math.floor(a.year/10)*10)).size}</strong><span>decades</span></div>
      </section>

      <section class="workspace" aria-label="Corpus explorer">
        <div class="workspace-heading">
          <div>
            <p class="eyebrow">YOUR VIEW OF OUR CORPUS</p>
            <h2>${Ve()}</h2>
          </div>
          <div class="year-filter">
            <label for="from-year">Years</label>
            <select id="from-year" aria-label="First year in range">${Pe(r.fromYear)}</select>
            <span>to</span>
            <select id="to-year" aria-label="Last year in range">${Pe(r.toYear)}</select>
            ${r.fromYear!==we||r.toYear!==$e?'<button class="reset-year-filter" id="show-all-years" type="button">Show all years</button>':""}
          </div>
        </div>
        <nav class="tool-tabs" aria-label="Corpus tools">
          <button class="tool-tab ${r.tab==="overview"?"active":""}" data-tab="overview" aria-current="${r.tab==="overview"?"page":"false"}">Explore</button>
          <button class="tool-tab ${r.tab==="concordance"?"active":""}" data-tab="concordance" aria-current="${r.tab==="concordance"?"page":"false"}">Word in Context</button>
          <button class="tool-tab ${r.tab==="ngrams"?"active":""}" data-tab="ngrams" aria-current="${r.tab==="ngrams"?"page":"false"}">Top n-grams</button>
          <button class="tool-tab ${r.tab==="compare"?"active":""}" data-tab="compare" aria-current="${r.tab==="compare"?"page":"false"}">Compare words &amp; phrases</button>
          <button class="tool-tab ${r.tab==="artists"?"active":""}" data-tab="artists" aria-current="${r.tab==="artists"?"page":"false"}">Browse artists</button>
          <button class="tool-tab ${r.tab==="songs"?"active":""}" data-tab="songs" aria-current="${r.tab==="songs"?"page":"false"}">Browse songs</button>
        </nav>

        <div class="tab-panel">
          ${r.tab==="overview"?Je(s):""}
          ${r.tab==="concordance"?et(s):""}
          ${r.tab==="ngrams"?Ze(s):""}
          ${r.tab==="compare"?tt(s):""}
          ${r.tab==="artists"?lt(s):""}
          ${r.tab==="songs"?ct(s):""}
        </div>
      </section>

      <footer class="site-footer">
        <p><a href="https://linguistics.as.uky.edu/">Linguistics Department</a> - <a href="https://www.uky.edu/">University of Kentucky</a></p>
        <p>Lyrics are shown for classroom research and exploration.</p>
      </footer>
    </main>
  `,ut()}function Ve(){return r.tab==="concordance"?"Find a word in context":r.tab==="ngrams"?"Explore frequent n-grams":r.tab==="compare"?"Compare word and phrase frequencies":r.tab==="artists"?"Browse artists by song count":r.tab==="songs"?"Browse the songs":"Explore the timeline"}function Pe(s){return Array.from({length:$e-we+1},(i,l)=>we+l).map(i=>`<option value="${i}" ${i===s?"selected":""}>${i}</option>`).join("")}function Je(s){var c;const a=Array.from({length:r.toYear-r.fromYear+1},(o,d)=>r.fromYear+d),i=new Map(a.map(o=>[o,0]));for(const o of s)i.set(o.year,(i.get(o.year)??0)+1);const l=new Map,u=new Map;for(const o of s){const d=new Set;for(const p of xe(o.lyrics))Me.has(p)||(l.set(p,(l.get(p)??0)+1),d.add(p));for(const p of d)u.set(p,(u.get(p)??0)+1)}const h=[...l.entries()].sort((o,d)=>d[1]-o[1]||o[0].localeCompare(d[0])).slice(0,12),w=((c=h[0])==null?void 0:c[1])??1,f=Math.max(1,...i.values());return`
    <div class="explore-grid">
      <section class="panel timeline-panel">
        <div class="panel-title-row">
          <div><h3>Hits through the years</h3><p>Each mark is a song in the collection. Click a year to focus on it or use the Years menus over on the right side of the page to select a specific multi-year range.</p></div>
          <span class="panel-index">01 / TIME</span>
        </div>
        <div class="timeline-wrap">
          <svg class="timeline-chart" viewBox="0 0 920 220" role="img" aria-label="Number of songs in our corpus by year">${Xe(i,a,f)}</svg>
        </div>
        <div class="chart-legend"><span><i></i> Songs in the collection</span><span>Year range: ${r.fromYear}–${r.toYear}</span></div>
	<div><h3>Year-based exploration</h3><p>Changing the selected years changes the data available to each of the tabs. Try comparing different years; can you see any patterns in the corpus?</p>
	</div>
      </section>

      <section class="panel word-panel">
        <div class="panel-title-row">
          <div><h3>Frequent words</h3><p>Common grammatical words (e.g. 'the', 'of', 'an', etc.) excluded.</p></div>
          <span class="panel-index">02 / WORDS</span>
        </div>
        ${h.length?`<div class="word-list">${h.map(([o,d],p)=>`
          <button class="word-row" data-word="${re(o)}" aria-label="Search for ${re(o)}, ${d} occurrences">
            <span class="word-rank">${String(p+1).padStart(2,"0")}</span>
            <span class="word-name">${U(o)}</span>
            <span class="word-track"><i style="width:${Math.max(4,d/w*100)}%"></i></span>
            <span class="word-count">${d.toLocaleString()}</span>
          </button>`).join("")}</div>`:'<p class="empty-state">No words to show in this year range.</p>'}
        <p class="panel-footnote">Word counts show total uses. Select a word to see every matching line.</p>
      </section>
    </div>
    <section class="question-strip">
      <div><span class="question-spark" aria-hidden="true">✳</span><div><h3>Not sure where to begin?</h3><p>Try one of these words and see how the preceding and following words inform their meanings.</p></div></div>
      <div class="suggestion-list">${["love","home","heart","road"].map(o=>`<button class="suggestion" data-word="${o}">${o}<span aria-hidden="true"> ↗</span></button>`).join("")}</div>
    </section>
  `}function Ze(s){var w;const a=r.ngramSize,i=new Map;for(const f of s){const c=xe(f.lyrics);for(let o=0;o<=c.length-a;o+=1){const d=c.slice(o,o+a);if(a===1&&Me.has(d[0]))continue;const p=d.join(" ");i.set(p,(i.get(p)??0)+1)}}const l=[...i.entries()].sort((f,c)=>c[1]-f[1]||f[0].localeCompare(c[0])).slice(0,50),u=((w=l[0])==null?void 0:w[1])??1,h={1:"Unigrams",2:"Bigrams",3:"Trigrams"};return`
    <section class="ngram-panel">
      <div class="ngram-intro">
        <p>n-grams help us visualize the most common single words (unigrams) and consecutive word sequences (bigrams and trigrams) in the selected years.</p>
        <p>unigrams omit common grammatical words (e.g. 'the') while bigrams and trigrams include all words.</p>
      </div>
      <div class="ngram-controls" role="group" aria-label="N-gram length">
        ${[1,2,3].map(f=>`
          <button class="ngram-control ${a===f?"active":""}" type="button" data-ngram-size="${f}" aria-pressed="${a===f}">
            ${h[f]}
          </button>`).join("")}
      </div>
      <div class="panel ngram-results">
        <div class="panel-title-row">
          <div><h3>Top 50 ${h[a].toLocaleLowerCase()}</h3><p>Occurrences in songs from ${r.fromYear}–${r.toYear}.</p></div>
          <span class="panel-index">${l.length} ${l.length===1?"item":"items"}</span>
        </div>
        ${l.length?`
          <ol class="ngram-list">
            ${l.map(([f,c],o)=>`
              <li class="ngram-row">
                <span class="word-rank">${String(o+1).padStart(2,"0")}</span>
                <span class="ngram-label">${U(f)}</span>
                <span class="word-track"><i style="width:${Math.max(4,c/u*100)}%"></i></span>
                <span class="word-count">${c.toLocaleString()}</span>
              </li>`).join("")}
          </ol>
        `:'<div class="empty-state large"><strong>No n-grams to show.</strong><p>Try a different year range.</p></div>'}
      </div>
    </section>
  `}function Xe(s,a,i){const f=a.length?848/a.length:848,c=Math.max(3,Math.min(12,f*.62)),d=[0,Math.ceil(i/2),i].filter((x,N,B)=>B.indexOf(x)===N).map(x=>{const N=166-x/i*152;return`<line class="grid-line" x1="44" x2="892" y1="${N}" y2="${N}"/><text class="axis-label" x="34" y="${N+4}" text-anchor="end">${x}</text>`}).join(""),p=a.map((x,N)=>{const B=s.get(x)??0;if(B===0)return"";const O=B/i*152,Z=44+N*f+(f-c)/2,ue=166-O;return`<rect class="year-bar" data-year="${x}" x="${Z.toFixed(2)}" y="${ue.toFixed(2)}" width="${c.toFixed(2)}" height="${O.toFixed(2)}" rx="2" tabindex="0" role="button" aria-label="${x}: ${B} ${B===1?"song":"songs"}"><title>${x}: ${B} ${B===1?"song":"songs"} (select to focus)</title></rect>`}).join(""),T=a.filter(x=>x%10===0).map(x=>`<text class="axis-label decade-label" x="${(44+a.indexOf(x)*f+f/2).toFixed(2)}" y="190" text-anchor="middle">${x}</text>`).join("");return`${d}${p}${T}`}function et(s){const a=r.concordanceQuery.trim(),i=a?ot(s,a,r.wholeWord):[],l=i.slice(0,Le),u=Math.ceil(l.length/Ce),h=Math.min(r.kwicPage,Math.max(0,u-1)),w=l.slice(h*Ce,(h+1)*Ce);return`
    <div class="concordance-intro"><span class="concordance-icon" aria-hidden="true">“ ”</span><p>A <strong>concordance</strong> puts each use of a word beside the words around it. Read across to spot patterns; compare years to see what changes.</p></div>
    <form class="search-form" id="concordance-form">
      <label for="concordance-query">What word or phrase are you curious about?</label>
      <div class="search-row"><span class="search-icon" aria-hidden="true"></span><input id="concordance-query" type="search" value="${re(r.concordanceQuery)}" placeholder="Try “home”, “freedom”, or “on the road”" autocomplete="off" /><button class="primary-button" type="submit">Find in lyrics <span aria-hidden="true">↗</span></button></div>
      <label class="checkbox-label"><input id="whole-word" type="checkbox" ${r.wholeWord?"checked":""} /><span>Match whole words (turn off to find a word inside longer words)</span></label>
    </form>
    ${a?`
      <div class="results-heading"><div><p class="eyebrow">YOUR CONCORDANCE</p><h3><span class="query-word">${U(a)}</span> <span class="result-total">${i.length.toLocaleString()} ${i.length===1?"match":"matches"}</span></h3></div><span class="panel-index">${r.fromYear}—${r.toYear}</span></div>
      ${i.length?`
        <div class="kwic-head" aria-hidden="true"><span>LEFT CONTEXT</span><span>SEARCHED WORD</span><span>RIGHT CONTEXT</span><span>SONG</span></div>
        <div class="kwic-list">${w.map(it).join("")}</div>
        ${i.length>Le?`<p class="limit-note">Showing the first ${Le.toLocaleString()} matches. Narrow the year range to explore a smaller sample.</p>`:""}
        ${Te(h,u,"kwic")}
      `:'<div class="empty-state large"><span aria-hidden="true">∅</span><strong>No matches in this year range.</strong><p>Try another spelling or expand the years.</p></div>'}
    `:`
      <div class="empty-prompt"><span class="prompt-orbit" aria-hidden="true">?</span><div><strong>Context can change a word entirely!</strong><p>Type a word above, or pick one to get started:</p><div class="suggestion-list">${["love","home","heart","road"].map(f=>`<button class="suggestion" data-word="${f}">${f}<span aria-hidden="true"> ↗</span></button>`).join("")}</div></div></div>
    `}
  `}function tt(s){const a=Se(r.compareFirst),i=Se(r.compareSecond),l=a&&i&&a.join(" ")!==i.join(" ");return`
    <div class="compare-intro">
      <span class="compare-icon" aria-hidden="true">↗</span>
      <p>Compare a word or phrase over time. Rates are shown per 100 lyric words, so years with more lyrics are not automatically higher. Matching ignores capitalization and punctuation, treats curly and straight apostrophes alike, and counts phrases when their words occur consecutively. </p>
    </div>
    <form class="compare-form" id="compare-form">
      <label for="compare-first">First word or phrase<input id="compare-first" type="text" value="${re(r.compareFirst)}" maxlength="60" autocomplete="off" /></label>
      <label for="compare-second">Second word or phrase<input id="compare-second" type="text" value="${re(r.compareSecond)}" maxlength="60" autocomplete="off" /></label>
      <button class="primary-button" type="submit">Compare <span aria-hidden="true">↗</span></button>
    </form>
    ${r.compareError?`<p class="compare-error" role="alert">${U(r.compareError)}</p>`:""}
    ${l?st(s,[{label:r.compareFirst.trim(),tokens:a},{label:r.compareSecond.trim(),tokens:i}]):'<div class="empty-state large"><strong>Enter two different words or phrases to compare.</strong><p>Use a word or short phrase in each field.</p></div>'}
  `}function Se(s){const a=xe(s);return a.length?a:null}function rt(s,a){let i=0;for(let l=0;l<=s.length-a.length;l+=1){let u=!0;for(let h=0;h<a.length;h+=1)if(s[l+h]!==a[h]){u=!1;break}u&&(i+=1)}return i}function st(s,a){if(s.length===0)return'<div class="empty-state large"><strong>No songs in this year range.</strong><p>Expand the year filters to compare frequencies.</p></div>';const i=Array.from({length:r.toYear-r.fromYear+1},(p,T)=>r.fromYear+T),l=new Map(i.map(p=>[p,{tokens:0,counts:[0,0]}]));let u=0;const h=[0,0];for(const p of s){const T=l.get(p.year),x=xe(p.lyrics);T.tokens+=x.length,u+=x.length;for(let N=0;N<a.length;N+=1){const B=rt(x,a[N].tokens);T.counts[N]+=B,h[N]+=B}}const w=i.map(p=>({year:p,...l.get(p)})),f=w.flatMap(p=>p.tokens?p.counts.map(T=>T/p.tokens*100):[]),c=f.length?Math.max(...f):0,o=at(c),d=h.map(p=>u?p/u*100:0);return`
    <section class="panel compare-chart-panel">
      <div class="panel-title-row">
        <div><h3>Word or phrase frequency by year</h3><p>Occurrences per 100 lyric words from each year.</p></div>
        <span class="panel-index">${r.fromYear}—${r.toYear}</span>
      </div>
      <div class="frequency-chart-wrap">
        <svg class="frequency-chart" viewBox="0 0 920 320" role="img" aria-label="Frequency per 100 lyric words for ${re(a[0].label)} and ${re(a[1].label)} by year">
          ${nt(w,a,o)}
        </svg>
      </div>
      <div class="frequency-legend">
        ${a.map((p,T)=>`
          <div class="frequency-legend-item">
            <span class="frequency-series series-${T===0?"a":"b"}"></span>
            <strong>${U(p.label)}</strong>
            <span>${h[T].toLocaleString()} uses · ${Oe(d[T])} per 100 words overall</span>
          </div>`).join("")}
      </div>
    </section>
  `}function nt(s,a,i){const f=O=>64+(r.toYear===r.fromYear?413:(O-r.fromYear)/(r.toYear-r.fromYear)*826),c=O=>238-O/i*220,d=[0,i/2,i].map(O=>{const Z=c(O);return`<line class="frequency-grid-line" x1="64" x2="890" y1="${Z}" y2="${Z}" /><text class="frequency-axis-label" x="54" y="${Z+4}" text-anchor="end">${Oe(O)}</text>`}).join(""),p=s.filter(O=>O.year%10===0).map(O=>O.year),x=(p.length?p:[...new Set([r.fromYear,r.toYear])]).map(O=>`<text class="frequency-axis-label" x="${f(O)}" y="262" text-anchor="middle">${O}</text>`).join(""),N=a.map((O,Z)=>{let ue="",ne=!1;for(const ae of s){if(ae.tokens===0){ne=!1;continue}const ge=ae.counts[Z]/ae.tokens*100;ue+=`${ne?"L":"M"}${f(ae.year).toFixed(2)},${c(ge).toFixed(2)} `,ne=!0}return`<path class="frequency-line series-${Z===0?"a":"b"}" d="${ue.trim()}" />`}).join(""),B=s.flatMap(O=>O.tokens===0?[]:a.map((Z,ue)=>{const ne=O.counts[ue],ae=ne/O.tokens*100;return`<circle class="frequency-point series-${ue===0?"a":"b"}" cx="${f(O.year).toFixed(2)}" cy="${c(ae).toFixed(2)}" r="3.5" tabindex="0"><title>${O.year}: ${U(Z.label)} occurred ${ne} ${ne===1?"time":"times"} in ${O.tokens.toLocaleString()} words (${Oe(ae)} per 100)</title></circle>`})).join("");return`${d}${N}${B}${x}`}function at(s){if(!Number.isFinite(s)||s<=0)return .1;const a=10**Math.floor(Math.log10(s)),i=s/a;return(i<=1?1:i<=2?2:i<=5?5:10)*a}function Oe(s){return s.toLocaleString(void 0,{maximumFractionDigits:2})}function ot(s,a,i){let l;try{l=new RegExp(Ke(a),"giu")}catch{return[]}const u=[];for(const h of s){l.lastIndex=0;for(const w of h.lyrics.matchAll(l)){const f=w.index,c=f+w[0].length;if(i&&(Fe(h.lyrics[f-1])||Fe(h.lyrics[c])))continue;const o=h.lyrics.slice(0,f).trim().split(/\s+/).slice(-5).join(" "),d=h.lyrics.slice(c).trim().split(/\s+/).slice(0,5).join(" ");u.push({song:h,left:o,match:w[0],right:d})}}return u}function Fe(s){return s!==void 0&&/[\p{L}\p{N}_'’]/u.test(s)}function it({song:s,left:a,match:i,right:l}){return`<article class="kwic-row">
    <span class="kwic-left">${U(a)}</span>
    <mark class="kwic-match">${U(i)}</mark>
    <span class="kwic-right">${U(l)}</span>
    <button class="kwic-song" data-song-id="${re(s.id)}" title="Open ${re(s.title)}">${U(s.title)}<small>${s.year} · ${U(s.artist)}</small></button>
  </article>`}function ct(s){const a=r.songQuery.trim().toLocaleLowerCase(),i=s.filter(w=>!a||`${w.title} ${w.artist} ${w.lyrics}`.toLocaleLowerCase().includes(a)).sort((w,f)=>w.year-f.year||Number(w.chartPosition)-Number(f.chartPosition)),l=Math.ceil(i.length/fe),u=Math.min(r.songPage,Math.max(0,l-1)),h=i.slice(u*fe,(u+1)*fe);return`
    <div class="song-browser-tools">
      <div><p class="eyebrow">THE SONGBOOK</p><p class="browser-explainer">Browse the collection by year, artist, title, or a word in the lyrics.</p></div>
      <label class="song-search"><span class="sr-only">Search song titles, artists, and lyrics</span><span class="search-icon" aria-hidden="true"></span><input id="song-query" type="search" value="${re(r.songQuery)}" placeholder="Search songs, artists, or lyrics" autocomplete="off" /></label>
    </div>
    <p class="browse-count">${i.length.toLocaleString()} ${i.length===1?"song":"songs"} in ${r.fromYear}–${r.toYear}</p>
    ${h.length?`<div class="song-list">${h.map(w=>De(w,a)).join("")}</div>${Te(u,l,"songs")}`:'<div class="empty-state large"><span aria-hidden="true">∅</span><strong>No songs found.</strong><p>Try a different search or year range.</p></div>'}
  `}function lt(s){const a=r.artistQuery.trim().toLocaleLowerCase(),i=new Map;for(const f of s){const c=f.artist.trim().replace(/\s+/g," "),o=Ne(c),d=i.get(o)??{key:o,name:c,songs:[],spellings:new Map};d.songs.push(f),d.spellings.set(c,(d.spellings.get(c)??0)+1),i.set(o,d)}for(const f of i.values())f.name=[...f.spellings.entries()].sort((c,o)=>o[1]-c[1]||c[0].localeCompare(o[0]))[0][0];const l=[...i.values()].filter(f=>f.name.toLocaleLowerCase().includes(a)).sort((f,c)=>c.songs.length-f.songs.length||f.name.localeCompare(c.name)),u=Math.ceil(l.length/fe),h=Math.min(r.artistPage,Math.max(0,u-1)),w=l.slice(h*fe,(h+1)*fe);return`
    <div class="song-browser-tools">
      <div><p class="eyebrow">THE ARTISTS</p><p class="browser-explainer">Browse artists and groups, ranked by how many songs they have in this year range. Expand a name to see its songs.</p></div>
      <label class="song-search"><span class="sr-only">Search artist and group names</span><span class="search-icon" aria-hidden="true"></span><input id="artist-query" type="search" value="${re(r.artistQuery)}" placeholder="Search artists or groups" autocomplete="off" /></label>
    </div>
    <p class="browse-count">${l.length.toLocaleString()} ${l.length===1?"artist or group":"artists and groups"} found in ${r.fromYear}–${r.toYear}, ranked by song count</p>
    ${w.length?`
      <div class="artist-list">
        ${w.map((f,c)=>{const o=r.expandedArtistId===f.key,d=f.songs.sort((p,T)=>p.year-T.year||Number(p.chartPosition)-Number(T.chartPosition));return`<section class="artist-card ${o?"expanded":""}">
            <button class="artist-summary" data-artist-id="${re(f.key)}" aria-expanded="${o}">
              <span class="artist-rank">${(h*fe+c+1).toString().padStart(2,"0")}</span>
              <span class="artist-name">${U(f.name)}</span>
              <span class="artist-song-count">${d.length} ${d.length===1?"song":"songs"}</span>
              <span class="expand-icon" aria-hidden="true">${o?"−":"+"}</span>
            </button>
            ${o?`<div class="artist-songs song-list">${d.map(p=>De(p,"")).join("")}</div>`:""}
          </section>`}).join("")}
      </div>
      ${Te(h,u,"artists")}
    `:'<div class="empty-state large"><span aria-hidden="true">∅</span><strong>No artists found.</strong><p>Try a different search or year range.</p></div>'}
  `}function De(s,a){const i=r.expandedSongId===s.id;return`<article class="song-card ${i?"expanded":""}">
    <button class="song-summary" data-song-id="${re(s.id)}" aria-expanded="${i}">
      <span class="song-year">${s.year}</span>
      <span class="song-main"><strong>${U(s.title)}</strong><small>${U(s.artist)}</small></span>
      <span class="song-position">${s.chartPosition?`#${U(s.chartPosition)}`:""}</span>
      <span class="expand-icon" aria-hidden="true">${i?"−":"+"}</span>
    </button>
    ${i?`<div class="song-lyrics"><div class="lyrics-label">LYRICS <span>·</span> ${s.year}</div><p>${dt(s.lyrics,a)}</p></div>`:""}
  </article>`}function dt(s,a){if(!a)return _e(s);const i=s.toLocaleLowerCase(),l=a.toLocaleLowerCase();let u=0,h="",w=i.indexOf(l);for(;w!==-1;)h+=`${_e(s.slice(u,w))}<mark>${_e(s.slice(w,w+a.length))}</mark>`,u=w+a.length,w=i.indexOf(l,u);return`${h}${_e(s.slice(u))}`}function _e(s){return U(s).replace(/\r?\n/g,"<br>")}function Te(s,a,i){return a<=1?"":`<nav class="pagination" aria-label="${i==="kwic"?"Concordance":i==="artists"?"Artist list":"Song list"} pages">
    <button class="page-button" data-page="${i}" data-direction="-1" ${s===0?"disabled":""}>← <span>Previous</span></button>
    <span>Page <strong>${s+1}</strong> of ${a}</span>
    <button class="page-button" data-page="${i}" data-direction="1" ${s>=a-1?"disabled":""}><span>Next</span> →</button>
  </nav>`}function ut(){var l,u,h,w,f,c;const s=q.querySelector(".site-menu-toggle");s==null||s.addEventListener("click",()=>{var d;const o=s.getAttribute("aria-expanded")==="true";s.setAttribute("aria-expanded",String(!o)),(d=q.querySelector("#site-navigation"))==null||d.classList.toggle("open",!o)}),q.querySelectorAll("[data-tab]").forEach(o=>{o.addEventListener("click",()=>Re(o.dataset.tab))}),q.querySelectorAll("[data-ngram-size]").forEach(o=>{o.addEventListener("click",()=>{r.ngramSize=Number(o.dataset.ngramSize),te()})}),q.querySelectorAll("[data-word]").forEach(o=>{o.addEventListener("click",()=>{r.concordanceQuery=o.dataset.word,Re("concordance")})});const a=q.querySelector("#from-year"),i=q.querySelector("#to-year");(l=q.querySelector("#show-all-years"))==null||l.addEventListener("click",()=>{r.fromYear=we,r.toYear=$e,Re("overview")}),a==null||a.addEventListener("change",()=>{r.fromYear=Number(a.value),r.fromYear>r.toYear&&(r.toYear=r.fromYear),r.kwicPage=0,r.songPage=0,r.artistPage=0,te()}),i==null||i.addEventListener("change",()=>{r.toYear=Number(i.value),r.toYear<r.fromYear&&(r.fromYear=r.toYear),r.kwicPage=0,r.songPage=0,r.artistPage=0,te()}),q.querySelectorAll(".year-bar").forEach(o=>{const d=()=>{r.fromYear=Number(o.dataset.year),r.toYear=Number(o.dataset.year),te()};o.addEventListener("click",d),o.addEventListener("keydown",p=>{(p.key==="Enter"||p.key===" ")&&(p.preventDefault(),d())})}),(u=q.querySelector("#concordance-form"))==null||u.addEventListener("submit",o=>{var d;o.preventDefault(),r.concordanceQuery=q.querySelector("#concordance-query").value.trim(),r.kwicPage=0,te(),(d=q.querySelector("#concordance-query"))==null||d.focus()}),(h=q.querySelector("#compare-form"))==null||h.addEventListener("submit",o=>{var x;o.preventDefault(),r.compareFirst=q.querySelector("#compare-first").value.trim(),r.compareSecond=q.querySelector("#compare-second").value.trim();const d=Se(r.compareFirst),p=Se(r.compareSecond);let T="#compare-first";d?p?d.join(" ")===p.join(" ")?(T="#compare-second",r.compareError="Choose two different words or phrases to compare."):r.compareError="":(T="#compare-second",r.compareError="Enter a word or phrase in the second field."):r.compareError="Enter a word or phrase in the first field.",te(),r.compareError&&((x=q.querySelector(T))==null||x.focus())}),(w=q.querySelector("#whole-word"))==null||w.addEventListener("change",o=>{r.wholeWord=o.target.checked,r.kwicPage=0,te()}),(f=q.querySelector("#song-query"))==null||f.addEventListener("input",o=>{const d=o.target.selectionStart;r.songQuery=o.target.value,r.songPage=0,te();const p=q.querySelector("#song-query");p.focus(),p.setSelectionRange(d,d)}),(c=q.querySelector("#artist-query"))==null||c.addEventListener("input",o=>{const d=o.target.selectionStart;r.artistQuery=o.target.value,r.artistPage=0,te();const p=q.querySelector("#artist-query");p.focus(),p.setSelectionRange(d,d)}),q.querySelectorAll("[data-page]").forEach(o=>{o.addEventListener("click",()=>{const d=Number(o.dataset.direction);o.dataset.page==="kwic"?r.kwicPage+=d:o.dataset.page==="artists"?r.artistPage+=d:r.songPage+=d,te()})}),q.querySelectorAll("[data-artist-id]").forEach(o=>{o.addEventListener("click",()=>{r.expandedArtistId=r.expandedArtistId===o.dataset.artistId?null:o.dataset.artistId,te()})}),q.querySelectorAll("[data-song-id]").forEach(o=>{o.addEventListener("click",()=>{const d=r.songs.find(p=>p.id===o.dataset.songId);if(d){if(r.expandedSongId=r.expandedSongId===d.id?null:d.id,r.tab==="concordance"){r.tab="songs",r.songQuery=d.title;const T=Ye().filter(x=>`${x.title} ${x.artist} ${x.lyrics}`.toLocaleLowerCase().includes(r.songQuery.toLocaleLowerCase())).findIndex(x=>x.id===d.id);r.songPage=T>=0?Math.floor(T/fe):0}te()}})})}function U(s){return String(s).replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function re(s){return U(s)}async function ht(){try{const s=await fetch(He);if(!s.ok)throw new Error(`The CSV request failed (${s.status}).`);r.songs=Ge(await s.text()),te()}catch(s){q.innerHTML=`<main class="error-state"><p class="eyebrow">CORPUS COULD NOT LOAD</p><h1>Something went wrong.</h1><p>${U(s.message)}</p><p>Check that <code>country-corpus.csv</code> is present and try again.</p></main>`,console.error(s)}}ht();
