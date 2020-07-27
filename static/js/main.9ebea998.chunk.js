(this.webpackJsonpfrontend=this.webpackJsonpfrontend||[]).push([[0],{104:function(e,t){},159:function(e,t,n){"use strict";n.r(t);var a=n(0),o=n.n(a),r=n(12),l=n.n(r),c=(n(74),n(6)),i=n(66),s=n(4),u=n(62),m=n.n(u),g=n(39),h=n(1),d=n(36),f=n.n(d),p=n(68),y=n(63),b=n.n(y),E=n(64),v=n.n(E);function C(e){return e.r%2===0&&e.c%2===0?"Ground":e.r%2===0&&e.c%2===1||e.r%2===1&&e.c%2===0?"Wall":"Pillar"}function w(e,t){return e.r===t.r&&e.c===t.c}function S(e,t){return e.r>=0&&e.r<t.h&&e.c>=0&&e.c<t.w}function k(e,t){return"Wall"===C(t)&&0!==e[t.r][t.c]}function N(e,t){var n=function(e){return{h:e.length,w:e[0].length}}(e);if("Ground"!==C(t))return[];for(var a=[{r:0,c:1},{r:0,c:-1},{r:1,c:0},{r:-1,c:0}],o=[],r=[t.r,t.c],l=r[0],c=r[1],i=0;i<a.length;i++){var s=[a[i].r,a[i].c],u=s[0],m=s[1],g={r:l+u,c:c+m},h={r:l+2*u,c:c+2*m};S(h,n)&&!k(e,g)&&o.push(h)}return o}function j(e,t,n){if(w(t,n))return 0;var a=e[0].length,o=function(e){return e.r*a+e.c},r=[];r.push(t);var l=new Map;for(l.set(o(t),0);r.length>0;)for(var c=r.shift(),i=N(e,c),s=0;s<i.length;s++){var u=i[s];if(!l.has(o(u))){if(l.set(o(u),l.get(o(c))+1),w(u,n))return l.get(o(u));r.push(u)}}return-1}function x(e,t,n){return-1!==j(e,t,n)}function T(e,t,n,a){if(k(e,a))return!1;e[a.r][a.c]=1;var o=function(e,t,n){for(var a=0;a<t.length;a++)if(!x(e,t[a],n[a]))return!1;return!0}(e,t,n);return e[a.r][a.c]=0,o}var O=37,I=12,R="#ffffff",W="#fbe4D6",B="#eaeaea",G="#f1bfa0",A="#cccccc",L=["face","outlet"],P="1px solid black",D=function(e){for(var t=e.grid,n=e.ghostAction,r=Object(c.a)(e.playerColors,2),l=r[0],i=r[1],s=Object(c.a)(e.playerPos,2),u=s[0],m=s[1],g=Object(c.a)(e.goals,2),d=g[0],f=g[1],p=e.handleClick,y=e.creatorToMove,b=t.length,E=t[0].length,v=[],S=0;S<b;S++)for(var k=0;k<E;k++)v[S*E+k]={r:S,c:k};var N=[O,I],j=N[0],x=N[1],T=Object(c.a)(L,2),D=T[0],M=T[1],_=(b-1)/2,J=(E-1)/2,V=Object(a.useState)(null),F=Object(c.a)(V,2),H=F[0],z=F[1],Y=function(){z(null)};return o.a.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(".concat(J,", ").concat(j,"px ").concat(x,"px) ").concat(j,"px"),gridTemplateRows:"repeat(".concat(_,", ").concat(j,"px ").concat(x,"px) ").concat(j,"px"),justifyContent:"center"}},v.map((function(e){var a,r=[w(e,u),w(e,m)],c=r[0],s=r[1],g=[w(e,d),w(e,f)],v=g[0],S=g[1],k=null!==n&&w(n,e),N=k&&y,j=k&&!y,x=C(e);a="Ground"===x?H&&w(e,H)?W:R:"Wall"===x?H&&w(e,H)?G:B:A;var T="";"Ground"===x&&(T+=" waves-effect waves-light"),"Wall"===x&&(T+=" waves-effect waves-dark");var O=c||s||N||j;if(v&&(T=l+" lighten-4"),S&&(T=i+" lighten-4"),"Wall"===x){var I=0!==t[e.r][e.c];(I||k)&&(I?(T=1===t[e.r][e.c]?l:i,T+=" darken-3"):(T=y?l:i,T+=" lighten-3"))}return o.a.createElement("div",{className:T,key:"cell_".concat(e.r,"_").concat(e.c),onClick:function(){"Pillar"!==x&&p(e)},onMouseEnter:function(){return function(e){z(e)}(e)},onMouseLeave:Y,style:{backgroundColor:a,display:"flex",justifyContent:"center",alignItems:"center",cursor:"pointer",borderTop:0===e.r?P:"",borderBottom:e.r===b-1?P:"",borderLeft:0===e.c?P:"",borderRight:e.c===E-1?P:""}},c&&o.a.createElement(h.Icon,{className:"".concat(l,"-text small")},D),s&&o.a.createElement(h.Icon,{className:"".concat(i,"-text small")},M),v&&!O&&o.a.createElement(h.Icon,{className:"white-text small"},D),S&&!O&&o.a.createElement(h.Icon,{className:"white-text small"},M),N&&"Ground"===x&&o.a.createElement(h.Icon,{className:"".concat(l,"-text small text-lighten-4")},D),j&&"Ground"===x&&o.a.createElement(h.Icon,{className:"".concat(i,"-text small text-lighten-4")},M))})))},M=(n(152),n(65)),_=n(26);n(156);var J=function(e){var t,n=e.gameName,a=e.showLobby,r=e.endGame,l=e.helpText;t=n?o.a.createElement("span",{style:{marginLeft:"1rem",marginRight:"1rem"}},o.a.createElement("span",null,"WallWars\xa0\xa0"),o.a.createElement(M.CopyToClipboard,{style:{cursor:"pointer"},text:n,onCopy:function(){return Object(_.c)("Game code copied to clipboard!",{autoClose:2500,hideProgressBar:!0,transition:_.a,pauseOnFocusLoss:!1})}},o.a.createElement("span",null,"Game ",n))):o.a.createElement("span",{style:{marginLeft:"1rem",marginRight:"1rem"}},"WallWars");var c=o.a.createElement("div",null,o.a.createElement("h6",null,"Wallwars is an online 2-player strategy game. The goal is to get to your goal before the opponent gets to hers, building walls to reshape the terrain to your advantage."),o.a.createElement("h6",null,"It is implemented by Nil M and inspired by a board game he played once as a kid, of which he doesn't remember the name, unfortunately."),o.a.createElement("h6",null,"The frontend is made with React, and the backend with Node.js, Express, and socket.io."),o.a.createElement("h6",null,"The source code is available at https://github.com/nmamano/WallWars"));return o.a.createElement("div",null,o.a.createElement(_.b,null),o.a.createElement(h.Navbar,{alignLinks:"right",brand:t,menuIcon:o.a.createElement(h.Icon,null,"menu"),options:{draggable:!0,edge:"left",inDuration:250,onCloseEnd:null,onCloseStart:null,onOpenEnd:null,onOpenStart:null,outDuration:200,preventScrolling:!0}},a&&o.a.createElement(h.Modal,{style:{color:"black"},actions:[o.a.createElement(h.Button,{style:{backgroundColor:"#009688",color:"white",marginRight:"1rem"},flat:!0,modal:"close",node:"button",waves:"green",onClick:r},"Quit game"),o.a.createElement(h.Button,{style:{backgroundColor:"#009688",color:"white"},flat:!0,modal:"close",node:"button",waves:"green"},"Close")],bottomSheet:!1,fixedFooter:!1,header:"Resign",open:!1,options:{dismissible:!0,endingTop:"10%",inDuration:250,opacity:.4,outDuration:250,preventScrolling:!0,startingTop:"4%"},trigger:o.a.createElement(h.NavItem,null,"Lobby")},o.a.createElement("p",null,"Are you sure you want to return to the lobby? You will not be able to rejoin this game.")),o.a.createElement(h.Modal,{style:{color:"black"},actions:[o.a.createElement(h.Button,{style:{backgroundColor:"#009688",color:"white"},flat:!0,modal:"close",node:"button",waves:"green"},"Close")],bottomSheet:!1,fixedFooter:!1,header:"Help",open:!1,options:{dismissible:!0,endingTop:"10%",inDuration:250,opacity:.4,outDuration:250,preventScrolling:!0,startingTop:"4%"},trigger:o.a.createElement(h.NavItem,null,"Help")},l),o.a.createElement(h.Modal,{style:{color:"black"},actions:[o.a.createElement(h.Button,{style:{backgroundColor:"#009688",color:"white"},flat:!0,modal:"close",node:"button",waves:"green"},"Close")],bottomSheet:!1,fixedFooter:!1,header:"About",open:!1,options:{dismissible:!0,endingTop:"10%",inDuration:250,opacity:.4,outDuration:250,preventScrolling:!0,startingTop:"4%"},trigger:o.a.createElement(h.NavItem,null,"About")},c)))},V=function(e){var t,n=e.names,a=e.lifeCycleStage,r=e.winner,l=e.finishReason,c=e.turnCount,i=e.indexToMove,s=e.timeControl,u=e.isVolumeOn,m=e.handleToggleVolume,g=n[i];switch(a){case-2:t="Haven't tried to connect to the server yet";break;case-1:t="Waiting for server response";break;case 0:t="Waiting for player 2 to join";break;case 1:t="".concat(g," starts");break;case 2:case 3:t="".concat(g," to move");break;case 4:t="draw"===r?"The game ended in a draw":"".concat(n["creator"===r?0:1]," won ").concat({time:"on time",goal:"by reaching the goal",resign:"by resignation"}[l]);break;default:console.error("stage should be in range [-2..4]")}return o.a.createElement(h.Row,{className:"container valign-wrapper",style:{marginTop:"10px",marginBottom:"10px"}},o.a.createElement(h.Col,{s:4},o.a.createElement("h6",null,t)),o.a.createElement(h.Col,{s:6},s&&o.a.createElement("h6",null,"Time control: ",s.duration,"+",s.increment)),o.a.createElement(h.Col,{s:1},o.a.createElement("h6",null,c)),o.a.createElement(h.Col,{s:1},o.a.createElement(h.Button,{className:"teal",node:"button",onClick:m,icon:o.a.createElement(h.Icon,{className:"large"},u?"volume_up":"volume_off")})))},F=function(e){var t=e.lifeCycleStage,n=e.names,a=e.playerColors,r=e.timeLeft,l=e.indexToMove,c=[Math.floor(r[0]/60),Math.floor(r[1]/60)],i=c[0],s=c[1],u=r[0]%60,m=r[1]%60,g=["".concat(i,":").concat(u<10?"0":"").concat(u),"".concat(s,":").concat(m<10?"0":"").concat(m)];t<0&&(g[0]="_:__",g[1]="_:__");var d=["",""];if(t<4){d[l]=" ".concat(a[l]," ").concat("lighten-1 z-depth-2")}var f=["",""];return 3===t&&(0===l?r[0]<15&&(f[0]=" ".concat("orange lighten-2 z-depth-3")):1===l&&r[1]<15&&(f[1]=" ".concat("orange lighten-2 z-depth-3"))),o.a.createElement(h.Row,{className:"valign-wrapper container"},o.a.createElement(h.Col,{className:"center"+d[0],s:2},o.a.createElement("h5",null,n[0])),o.a.createElement(h.Col,{className:"center"+f[0],s:2,style:{margin:"0rem 1rem"}},o.a.createElement("h5",null,g[0])),o.a.createElement(h.Col,{s:4}),o.a.createElement(h.Col,{className:"center"+f[1],s:2,style:{margin:"0rem 1rem"}},o.a.createElement("h5",null,g[1])),o.a.createElement(h.Col,{className:"center"+d[1],s:2},o.a.createElement("h5",null,null===n[1]?"______":n[1])))},H=function(){return o.a.createElement("div",null,o.a.createElement("h6",null,'To connect with your friend, share the game code in the top header with them and tell them to use it when clicking "Join Game" from the lobby. Click on the code to copy it to the clipboard.'),o.a.createElement("h6",null,"Rules of the game:"),o.a.createElement("h6",null,"The player who created the game starts at the top left corner (color red). The player who joined the game starts at the top right (color blue). The goal of each player is to reach the ",o.a.createElement("em",null,"opposite")," corner from where they start. The player who gets there first, wins."),o.a.createElement("h6",null,"Players move by clicking cells on the board. There are two types of cells: ground cells (the big squares) and walls (the thin rectangles in between ground cells). Each move consists of a total of two actions. One action can be building one wall or moving to an adjacent cell (a diagonal move counts as two actions)."),o.a.createElement("h6",null,"Players can build walls to obstruct the opponent. Walls can be built anywhere as long as there always exists at least one way to get to their goal."),o.a.createElement("h6",null,"The remaining time for each player is shown next to their name. The clock of a player ticks down when it is their turn (after each player has moved once). The player who starts is chosen randomly. The name of the player to move next is highlighted with their color."),o.a.createElement("h6",null,"If it is your turn and you do a single action, like building a wall or moving to an adjacent cell, you can undo it by clicking the wall again or clicking a different ground cell, respectively. Once you choose 2 actions, the move becomes permanent."),o.a.createElement("h6",null,"Special rules:"),o.a.createElement("h6",null,"(1) no walls can be placed during the first move of each player."),o.a.createElement("h6",null,"(2) if the player who moved first reaches the goal first but the other player is at distance 1 or 2 from her goal, the game ends in a draw."),o.a.createElement("h6",null,"Note: if you return to the lobby, you will not be able to reenter this game!"))},z=new b.a(v.a),Y={w:23,h:19},Q={tl:{r:0,c:0},tr:{r:0,c:Y.w-1},bl:{r:Y.h-1,c:0},br:{r:Y.h-1,c:Y.w-1}},q=[Q.tl,Q.tr],K=[Q.br,Q.bl],U=["red","indigo"],X=function(e,t){return e%2===(t?0:1)},Z=function(e,t){return X(e,t)?0:1},$=function(e){return e%2===0},ee=function(e){for(var t=[],n=0;n<e.h;n++){t[n]=[];for(var a=0;a<e.w;a++)t[n][a]=0}return t},te=function(e){return null===e?"None":C(e)},ne=function(e,t,n,a,o){if(!(e.lifeCycleStage<1||e.lifeCycleStage>3)&&e.turnCount===n-1){o&&z.play();for(var r=Z(e.turnCount,e.creatorStarts),l=0===r?1:0,c=0;c<t.length;c++){var i=t[c],s=C(i);if("Ground"===s){if(e.playerPos[r]=i,w(i,K[r])){var u=$(e.turnCount),m=j(e.grid,e.playerPos[l],K[l]);u&&m<=2?(e.winner="draw",e.finishReason="goal",e.lifeCycleStage=4):(e.winner=0===r?"creator":"joiner",e.finishReason="goal",e.lifeCycleStage=4)}}else"Wall"===s?e.grid[i.r][i.c]=r+1:console.error("unexpected action type",s)}a&&(e.timeLeft[r]=a),e.ghostAction=null,e.turnCount=n,1===e.lifeCycleStage&&1===n?e.lifeCycleStage=2:2===e.lifeCycleStage&&2===n&&(e.lifeCycleStage=3)}},ae=function(e){var t=e.socket,n=e.creatorParams,r=e.joinerParams,l=e.returnToLobby,i=null!==n,s=Object(p.a)({gameId:i?null:r.gameId,timeControl:i?n.timeControl:null,names:[i?n.creatorName:null,i?null:r.joinerName],creatorStarts:null,turnCount:0,playerPos:q,grid:ee(Y),timeLeft:[i?60*n.timeControl.duration:null,i?60*n.timeControl.duration:null],winner:"",finishReason:"",lifeCycleStage:-2,ghostAction:null,isVolumeOn:!1,showBackButtonWarning:!1}),u=Object(c.a)(s,2),m=u[0],g=u[1],d=function(e){e.preventDefault(),g((function(e){e.showBackButtonWarning=!0}))};Object(a.useEffect)((function(){return window.history.pushState(null,null,window.location.pathname),window.addEventListener("popstate",d),function(){return window.removeEventListener("popstate",d)}}));Object(a.useEffect)((function(){-2===m.lifeCycleStage&&(i&&(g((function(e){e.lifeCycleStage=-1})),t.emit("createGame",m.timeControl,m.names[0])),i||(g((function(e){e.lifeCycleStage=-1})),t.emit("joinGame",m.gameId,m.names[1])))})),Object(a.useEffect)((function(){return t.once("gameCreated",(function(e){var t=e.gameId,n=e.creatorStarts;g((function(e){0!==e.lifeCycleStage&&(e.gameId=t,e.creatorStarts=n,e.lifeCycleStage=0)}))})),t.once("gameJoined",(function(e){var t=e.creatorStarts,n=e.creatorName,a=e.timeControl;g((function(e){console.log("game joined"),1!==e.lifeCycleStage&&(e.creatorStarts=t,e.names[0]=n,e.timeControl=a,e.timeLeft=[60*a.duration,60*a.duration],e.lifeCycleStage=1)}))})),t.once("joinerJoined",(function(e){g((function(t){1!==t.lifeCycleStage&&(t.names[1]=e,t.lifeCycleStage=1)}))})),t.on("rematchStarted",(function(e){console.log("rematch started"),g((function(t){t.gameId=e,t.creatorStarts=!t.creatorStarts,t.turnCount=0,t.playerPos=q,t.grid=ee(Y),t.timeLeft=[60*t.timeControl.duration,60*t.timeControl.duration],t.winner="",t.finishReason="",t.lifeCycleStage=1,t.ghostAction=null}))})),t.on("playerResigned",(function(e){g((function(t){t.lifeCycleStage=4,t.winner=e?"joiner":"creator",t.finishReason="resign"}))})),t.on("move",(function(e,t,n){g((function(a){console.log("move ".concat(t," received ").concat(n)),ne(a,e,t,n,m.isVolumeOn)}))})),function(){t.removeAllListeners()}}),[t,g,i,m.gameId,m.isVolumeOn]),Object(a.useEffect)((function(){var e=setInterval((function(){g((function(e){if(3===e.lifeCycleStage){var t=Z(e.turnCount,e.creatorStarts);e.timeLeft[t]-=1,0===e.timeLeft[t]&&(e.winner=0===t?"joiner":"creator",e.finishReason="time",e.lifeCycleStage=4)}}))}),1e3);return function(){return clearInterval(e)}}),[g]);var y=function(){t.emit("endGame",m.gameId),l()};return o.a.createElement("div",null,o.a.createElement(J,{gameName:m.gameId,showLobby:!0,endGame:y,helpText:H()}),o.a.createElement(V,{lifeCycleStage:m.lifeCycleStage,names:m.names,indexToMove:Z(m.turnCount,m.creatorStarts),winner:m.winner,finishReason:m.finishReason,turnCount:m.turnCount,timeControl:m.timeControl,isVolumeOn:m.isVolumeOn,handleToggleVolume:function(){g((function(e){e.isVolumeOn=!e.isVolumeOn}))}}),o.a.createElement(F,{lifeCycleStage:m.lifeCycleStage,names:m.names,indexToMove:Z(m.turnCount,m.creatorStarts),playerColors:U,timeLeft:m.timeLeft}),o.a.createElement(h.Row,{className:"valign-wrapper"},o.a.createElement(h.Col,{s:3}),o.a.createElement(h.Col,{s:6},o.a.createElement(D,{creatorToMove:X(m.turnCount,m.creatorStarts),playerColors:U,grid:m.grid,playerPos:m.playerPos,goals:K,ghostAction:m.ghostAction,handleClick:function(e){if(i===X(m.turnCount,m.creatorStarts)&&!(m.lifeCycleStage<1)&&!(m.lifeCycleStage>3)){var n=C(e);if(!(m.lifeCycleStage<3&&"Wall"===n)){var a=function(e){var t=Z(m.turnCount,m.creatorStarts),n=C(e);if("Ground"===n)return j(m.grid,m.playerPos[t],e);if("Wall"===n){var a=f()(m.grid),o=f()(m.playerPos),r=te(m.ghostAction);return"Wall"===r?a[m.ghostAction.r][m.ghostAction.c]=1:"Ground"===r&&(o[t]=m.ghostAction),T(a,o,K,e)?1:0}console.error("unexpected action type",n)}(e),o=te(m.ghostAction),r=null,l=null;if("None"===o)if("Wall"===n){if(1!==a)return;l=e}else if("Ground"===n)if(1===a)l=e;else{if(2!==a)return;r=[e]}else console.error("unexpected action type",n);else if("Wall"===o)if("Wall"===n)if(w(m.ghostAction,e))l=null;else{if(1!==a)return;r=[e,m.ghostAction]}else if("Ground"===n){if(1!==a)return;r=[e,m.ghostAction]}else console.error("unexpected action type",n);else if("Ground"===o)if("Wall"===n){if(1!==a)return;r=[e,m.ghostAction]}else if("Ground"===n)if(0===a)l=null;else if(1===a){if(w(e,m.ghostAction))return;l=e}else{if(2!==a)return;r=[e]}else console.error("unexpected action type",n);else console.error("unexpected ghost type",o);if(r){var c=Z(m.turnCount,m.creatorStarts),s=m.timeLeft[c];3===m.lifeCycleStage&&(s+=m.timeControl.increment),t.emit("move",r,s),g((function(e){ne(e,r,m.turnCount+1,s,m.isVolumeOn)}))}else g((function(e){e.ghostAction=l}))}}}})),o.a.createElement(h.Col,{s:3,className:"center"},3===m.lifeCycleStage&&o.a.createElement("div",{className:"container teal darken-2",style:{padding:"0.2rem"}},o.a.createElement(h.Row,{className:"valign-wrapper",style:{paddingTop:"1rem"}},o.a.createElement(h.Col,{s:12},o.a.createElement(h.Button,{className:"red",node:"button",waves:"light",disabled:!0,onClick:function(){}},"Offer Draw"))),o.a.createElement(h.Row,{className:"valign-wrapper"},o.a.createElement(h.Col,{s:12},o.a.createElement(h.Modal,{style:{color:"black"},actions:[o.a.createElement(h.Button,{style:{backgroundColor:"#009688",color:"white",marginRight:"1rem"},flat:!0,modal:"close",node:"button",waves:"green",onClick:function(){t.emit("resign",m.gameId)}},"Resign"),o.a.createElement(h.Button,{style:{backgroundColor:"#009688",color:"white"},flat:!0,modal:"close",node:"button",waves:"green"},"Close")],bottomSheet:!1,fixedFooter:!1,header:"Resign",open:!1,options:{dismissible:!0,endingTop:"10%",inDuration:250,opacity:.4,outDuration:250,preventScrolling:!0,startingTop:"4%"},trigger:o.a.createElement(h.Button,{className:"red",node:"button",waves:"light"},"Resign")},o.a.createElement("p",null,"Are you sure you want to resign?"))))))),4===m.lifeCycleStage&&o.a.createElement(h.Row,{className:"valign-wrapper",style:{marginTop:"1rem"}},o.a.createElement(h.Col,{s:4}),o.a.createElement(h.Col,{className:"center",s:4},o.a.createElement(h.Button,{large:!0,className:"red",node:"button",waves:"light",onClick:function(){t.emit("rematch",m.gameId)}},"Rematch")),o.a.createElement(h.Col,{s:4})),o.a.createElement(h.Modal,{style:{color:"black"},actions:[o.a.createElement(h.Button,{style:{backgroundColor:"#009688",color:"white",marginRight:"1rem"},flat:!0,modal:"close",node:"button",waves:"green",onClick:function(){g((function(e){e.showBackButtonWarning=!1})),y()}},"Quit game"),o.a.createElement(h.Button,{style:{backgroundColor:"#009688",color:"white"},flat:!0,modal:"close",node:"button",waves:"green",onClick:function(){g((function(e){e.showBackButtonWarning=!1}))}},"Close")],bottomSheet:!1,fixedFooter:!1,header:"Return to lobby",open:m.showBackButtonWarning,options:{dismissible:!1,endingTop:"10%",inDuration:250,opacity:.4,outDuration:250,preventScrolling:!0,startingTop:"4%"}},o.a.createElement("p",null,"Are you sure you want to return to the lobby? You will not be able to rejoin this game.")))},oe=function(e){var t=e.playerName,n=e.handlePlayerName,a=e.duration,r=e.handleDuration,l=e.increment,c=e.handleIncrement,i=e.joinGameId,s=e.handleJoinGameId,u=e.handleCreateGame,m=e.handleJoinGame;return o.a.createElement("div",{className:"container teal darken-2",style:{marginTop:"2rem"}},o.a.createElement(h.Row,{className:"valign-wrapper"},o.a.createElement(h.Col,{className:"center",s:3},o.a.createElement("h5",null,"Your name:")),o.a.createElement(h.Col,{s:3},o.a.createElement(h.TextInput,{id:"nameInput",value:t,onChange:n})),o.a.createElement(h.Col,{s:6})),o.a.createElement(h.Row,{className:"valign-wrapper"},o.a.createElement(h.Col,{className:"center",s:3},o.a.createElement(h.Button,{node:"button",waves:"light",onClick:u},"Create game")),o.a.createElement(h.Col,{s:1,style:{paddingRight:"0"}},o.a.createElement(h.TextInput,{id:"durationInput",label:"Duration",value:"".concat(a),onChange:r})),o.a.createElement(h.Col,{s:1,style:{paddingLeft:"0"}},"m"),o.a.createElement(h.Col,{s:1,style:{paddingRight:"0"}},o.a.createElement(h.TextInput,{id:"incrementInput",label:"Increment",value:"".concat(l),onChange:c})),o.a.createElement(h.Col,{s:1,style:{paddingLeft:"0"}},"s"),o.a.createElement(h.Col,{s:5})),o.a.createElement(h.Row,{className:"valign-wrapper"},o.a.createElement(h.Col,{className:"center",s:3},o.a.createElement(h.Button,{node:"button",waves:"light",onClick:m},"Join game")),o.a.createElement(h.Col,{s:5},o.a.createElement(h.TextInput,{id:"joinInput",placeholder:"Write game code here...",value:"".concat(i),onChange:s})),o.a.createElement(h.Col,{s:4})))},re=function(){return o.a.createElement("div",null,o.a.createElement("h6",null,"This is the lobby. Here, you can create games that your friends can join, or join a friend's game."),o.a.createElement("h6",null,"When you create a game, you can choose the ",o.a.createElement("em",null,"duration")," (the time that each player has) and a time",o.a.createElement("em",null,"increment")," that is added to each player after they move."),o.a.createElement("h6",null,"Once you create a game, a ",o.a.createElement("em",null,"game code")," will appear in the top header. Share this code with your friend to play with them."),o.a.createElement("h6",null,'To join a friend\'s game, write the code they give you in the box next to the "Join game" button and click it.'),o.a.createElement("h6",null,"A random ",o.a.createElement("em",null,"username")," has been chosen for you, but you can change it."))},le=function(e){var t=e.socket,n=Object(a.useState)(Object(g.b)({dictionaries:[g.a],length:1}).slice(0,6)),r=Object(c.a)(n,2),l=r[0],i=r[1],s=Object(a.useState)(3),u=Object(c.a)(s,2),m=u[0],h=u[1],d=Object(a.useState)(2),f=Object(c.a)(d,2),p=f[0],y=f[1],b=Object(a.useState)(""),E=Object(c.a)(b,2),v=E[0],C=E[1],w=Object(a.useState)(!1),S=Object(c.a)(w,2),k=S[0],N=S[1],j=Object(a.useState)(null),x=Object(c.a)(j,2),T=x[0],O=x[1],I=Object(a.useState)(null),R=Object(c.a)(I,2),W=R[0],B=R[1];return o.a.createElement("div",{style:{marginBottom:"2rem"}},k&&o.a.createElement(ae,{socket:t,creatorParams:T,joinerParams:W,returnToLobby:function(){N(!1),O(null),B(null),C("")}}),!k&&o.a.createElement("div",null,o.a.createElement(J,{gameName:"",helpText:re()}),o.a.createElement(oe,{playerName:l,handlePlayerName:function(e){i(e.target.value.slice(0,8))},duration:m,handleDuration:function(e){return h(e.target.value)},increment:p,handleIncrement:function(e){return y(e.target.value)},joinGameId:v,handleJoinGameId:function(e){return C(e.target.value)},handleCreateGame:function(){var e=[parseFloat(m),parseFloat(p)],t=e[0],n=e[1];(isNaN(t)||t<.1)&&(t=3,console.log("given duration is not a number, using default value instead")),(isNaN(n)||n<0)&&(n=2,console.log("given increment is not a number, using default value instead")),O({timeControl:{duration:t,increment:n},creatorName:""===l?"Anon":l}),N(!0)},handleJoinGame:function(){B({gameId:v,joinerName:""===l?"Anon":l}),N(!0)}})))},ce=function(){console.log("connecting to backend at ".concat("https://wallwars.herokuapp.com/"));var e=Object(a.useState)(m()("https://wallwars.herokuapp.com/")),t=Object(c.a)(e,1)[0];return o.a.createElement(o.a.StrictMode,null,o.a.createElement(i.a,null,o.a.createElement(s.d,null,o.a.createElement(s.b,{path:"/wallwars/index.html",exact:!0},o.a.createElement(le,{socket:t})),o.a.createElement(s.a,{to:"/wallwars/index.html"}))))};l.a.render(o.a.createElement(ce,null),document.getElementById("root"))},64:function(e,t,n){e.exports=n.p+"static/media/moveSound.6df49e4b.mp3"},69:function(e,t,n){e.exports=n(159)},74:function(e,t,n){}},[[69,1,2]]]);
//# sourceMappingURL=main.9ebea998.chunk.js.map