"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[513],{3905:(e,n,t)=>{t.r(n),t.d(n,{MDXContext:()=>m,MDXProvider:()=>c,mdx:()=>g,useMDXComponents:()=>d,withMDXComponents:()=>u});var o=t(67294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(){return a=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o])}return e},a.apply(this,arguments)}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,o,i=function(e,n){if(null==e)return{};var t,o,i={},a=Object.keys(e);for(o=0;o<a.length;o++)t=a[o],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)t=a[o],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var m=o.createContext({}),u=function(e){return function(n){var t=d(n.components);return o.createElement(e,a({},n,{components:t}))}},d=function(e){var n=o.useContext(m),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},c=function(e){var n=d(e.components);return o.createElement(m.Provider,{value:n},e.children)},p="mdxType",h={inlineCode:"code",wrapper:function(e){var n=e.children;return o.createElement(o.Fragment,{},n)}},v=o.forwardRef((function(e,n){var t=e.components,i=e.mdxType,a=e.originalType,r=e.parentName,m=s(e,["components","mdxType","originalType","parentName"]),u=d(t),c=i,p=u["".concat(r,".").concat(c)]||u[c]||h[c]||a;return t?o.createElement(p,l(l({ref:n},m),{},{components:t})):o.createElement(p,l({ref:n},m))}));function g(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=t.length,r=new Array(a);r[0]=v;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l[p]="string"==typeof e?e:i,r[1]=l;for(var m=2;m<a;m++)r[m]=t[m];return o.createElement.apply(null,r)}return o.createElement.apply(null,t)}v.displayName="MDXCreateElement"},70140:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>r,default:()=>d,frontMatter:()=>a,metadata:()=>l,toc:()=>m});var o=t(87462),i=(t(67294),t(3905));const a={id:"bxl_telemetry",title:"BXL Telemetry"},r=void 0,l={unversionedId:"developers/bxl_telemetry",id:"developers/bxl_telemetry",title:"BXL Telemetry",description:"Telemetry",source:"@site/../docs/developers/bxl_telemetry.md",sourceDirName:"developers",slug:"/developers/bxl_telemetry",permalink:"/docs/developers/bxl_telemetry",draft:!1,tags:[],version:"current",frontMatter:{id:"bxl_telemetry",title:"BXL Telemetry"},sidebar:"manualSidebar",previous:{title:"Target Universe in BXL",permalink:"/docs/developers/target_universe"},next:{title:"BXL and Anonymous Targets",permalink:"/docs/developers/anon_targets"}},s={},m=[{value:"Telemetry",id:"telemetry",level:2},{value:"Emitting events from your BXL script",id:"emitting-events-from-your-bxl-script",level:3},{value:"User event log",id:"user-event-log",level:3},{value:"Getting a user event log from a normal event log",id:"getting-a-user-event-log-from-a-normal-event-log",level:3},{value:"Event log output",id:"event-log-output",level:3}],u={toc:m};function d(e){let{components:n,...t}=e;return(0,i.mdx)("wrapper",(0,o.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,i.mdx)("h2",{id:"telemetry"},"Telemetry"),(0,i.mdx)("h3",{id:"emitting-events-from-your-bxl-script"},"Emitting events from your BXL script"),(0,i.mdx)("p",null,"In BXL, you can emit custom events via ",(0,i.mdx)("inlineCode",{parentName:"p"},"ctx.instant_event()"),", which takes in two\nnamed parameters:"),(0,i.mdx)("ul",null,(0,i.mdx)("li",{parentName:"ul"},(0,i.mdx)("inlineCode",{parentName:"li"},"id"),": string, identifies your event. Helpful to identify your event when\nlooking through event logs. Ids do not have to be unique in a single BXL\nscript."),(0,i.mdx)("li",{parentName:"ul"},(0,i.mdx)("inlineCode",{parentName:"li"},"metadata"),": dict, where keys are strings, and values are strings, bools, ints,\nor lists/dicts of the mentioned types. You can put any metadata you wish here.")),(0,i.mdx)("p",null,"Example:"),(0,i.mdx)("pre",null,(0,i.mdx)("code",{parentName:"pre",className:"language-python"},'def _impl(ctx):\n  ctx.instant_event(id = "id1", metadata = {"foo": "bar"})\n\nmy_script = bxl_main(\n  impl = _impl,\n  cli_args = {},\n)\n')),(0,i.mdx)("p",null,"Only instant events can be manually created within BXL at this time, which means\nthat the event represents a single point in time. If you need something similar\nto spans (start and end events which encompass a range of time) for measuring\nthe duration of a particular section (excluding actions - see below for more\ninformation), you could couple instant events with the global ",(0,i.mdx)("inlineCode",{parentName:"p"},"now()")," function\nto measure the duration yourself:"),(0,i.mdx)("pre",null,(0,i.mdx)("code",{parentName:"pre",className:"language-python"},'def _impl(ctx):\n  instant = now()\n\n  # do something time intensive\n  end = instant.elapsed_millis()\n  ctx.instant_event(id = "id1", metadata = {"duration": end})\n\n  # do something else time intensive\n  end = instant.elapsed_millis()\n  ctx.instant_event(id = "id2", metadata = {"duration": end})\n\nmy_script = bxl_main(\n  impl = _impl,\n  cli_args = {},\n)\n')),(0,i.mdx)("p",null,(0,i.mdx)("strong",{parentName:"p"},"Measuring time for actions and ensuring artifacts")),(0,i.mdx)("p",null,"You cannot use ",(0,i.mdx)("inlineCode",{parentName:"p"},"now()")," to measure the time it takes to run actions and ensure\nartifacts because these processes occur asynchronously outside of the BXL script\nexecution. For BXL user telemetry, we emit action events via the buck2 core\nautomatically. Events around ensuring the artifacts are not emitted currently,\nbut will be added soon."),(0,i.mdx)("h3",{id:"user-event-log"},"User event log"),(0,i.mdx)("p",null,"To write to your own event log when running BXL, you can run your BXL command\nwith the ",(0,i.mdx)("inlineCode",{parentName:"p"},"--user-event-log")," flag to tell buck2 where to write the events to.\nBuck2 is aware of the following file extensions: ",(0,i.mdx)("inlineCode",{parentName:"p"},".json-lines"),",\n",(0,i.mdx)("inlineCode",{parentName:"p"},"json-lines.zst"),", ",(0,i.mdx)("inlineCode",{parentName:"p"},".json-lines.gz"),", and will compress the files automatically\nfor you depending on the extension. If the extension is not one of these, the\nlogs will always be written in JSONL format, uncompressed."),(0,i.mdx)("p",null,"Example:"),(0,i.mdx)("pre",null,(0,i.mdx)("code",{parentName:"pre"},"buck2 bxl path//to/my_script/script.bxl:my_script --user-event-log my_file.json-lines.gz\n")),(0,i.mdx)("p",null,"When using this flag to write to a custom event log, it is up to you to clean up\nthese log files. In addition, if the same filename is used with subsequent BXL\ninvocations, events are always appended to the existing file contents, which is\nthe same behavior as ",(0,i.mdx)("inlineCode",{parentName:"p"},"buck2 <any command> --event-log <path>"),". If you tell buck2\nto write to a compressed file, you are responsible for decompressing them."),(0,i.mdx)("h3",{id:"getting-a-user-event-log-from-a-normal-event-log"},"Getting a user event log from a normal event log"),(0,i.mdx)("p",null,(0,i.mdx)("inlineCode",{parentName:"p"},"buck2 log show-user")," can be used to convert a normal event log (regardless of\nencoding/compression) to a user event. Similar to ",(0,i.mdx)("inlineCode",{parentName:"p"},"buck2 log show"),", you can\nchoose the most recent invocation, or the nth invocation, or provide a path to\nthe normal user event log. Note that user event logs are not able to be passed\ninto ",(0,i.mdx)("inlineCode",{parentName:"p"},"buck2 log show")," or ",(0,i.mdx)("inlineCode",{parentName:"p"},"buck2 log show-user"),"."),(0,i.mdx)("h3",{id:"event-log-output"},"Event log output"),(0,i.mdx)("p",null,"The first line of your event log will always be the invocation record, which\ncontains useful things like command line args used, working directory, etc. The\nsubsequent lines are either instant events and/or action events, depending on\nyour BXL script's contents."),(0,i.mdx)("p",null,(0,i.mdx)("strong",{parentName:"p"},"Instant event")),(0,i.mdx)("p",null,"Sample:"),(0,i.mdx)("pre",null,(0,i.mdx)("code",{parentName:"pre",className:"language-python"},'{\n  "StarlarkUserEvent": {\n    "id": "foo",\n    "metadata": {\n      "bool_value": true,\n      "string_value": "str",\n      "int_value": 123,\n      "list_value": [\n        "a",\n        "b",\n        "c"\n      ],\n      "dict_value": {\n        "foo": "bar"\n      }\n    },\n  },\n  "epoch_millis": 123456789 # when the event was emitted\n}\n')),(0,i.mdx)("p",null,(0,i.mdx)("strong",{parentName:"p"},"Action event")),(0,i.mdx)("pre",null,(0,i.mdx)("code",{parentName:"pre",className:"language-python"},'{\n  "ActionExecutionEvent": {\n    "kind": "Write", # kind of action, like write or run\n    "name": { # name of the action, for user display. Unique within the execution of a particular target\n      "category": "write", # category for the action\n      "identifier": "my_output" # identifier for the action\n    },\n    "duration_millis": 0, # duration of the action in millis, excluding input materialization time\n    "output_size": 10, # size in bytes of the action\'s outputs\n    "input_materialization_duration_millis": 0, # how long it took to materialize any inputs to the action\n    "execution_kind": "Simple", # how the action was executed\n    "owner": "cell//path/to/script.bxl:function_name" # owner of the action execution (target label, anon target label, bxl label)\n  },\n  "epoch_millis": 123456789 # when the event was emitted\n}\n')),(0,i.mdx)("p",null,(0,i.mdx)("inlineCode",{parentName:"p"},"execution_kind")," includes:"),(0,i.mdx)("ul",null,(0,i.mdx)("li",{parentName:"ul"},"Local: action was executed locally"),(0,i.mdx)("li",{parentName:"ul"},"Remote: action was executed via a remote executor"),(0,i.mdx)("li",{parentName:"ul"},"ActionCache: action was served by the action cache and not executed"),(0,i.mdx)("li",{parentName:"ul"},"Simple: action is simple and executed inline within buck2 (ex: write,\nsymlink_dir)"),(0,i.mdx)("li",{parentName:"ul"},"Skipped: action was not executed at all"),(0,i.mdx)("li",{parentName:"ul"},"Deferred: action logically executed, but didn't do all the work"),(0,i.mdx)("li",{parentName:"ul"},"LocalDepFile: action was served by the local dep file cache and not executed."),(0,i.mdx)("li",{parentName:"ul"},"LocalWorker: action was executed via a local worker"),(0,i.mdx)("li",{parentName:"ul"},"NotSet: action execution kind was not set")),(0,i.mdx)("p",null,(0,i.mdx)("strong",{parentName:"p"},"Ensure artifact event")),(0,i.mdx)("pre",null,(0,i.mdx)("code",{parentName:"pre",className:"language-python"},'{\n  "BxlEnsureArtifactsEvent": {\n    "duration_millis": 0, # duration of ensuring the artifact\n  },\n  "epoch_millis": 123456789 # when the event was emitted\n}\n')))}d.isMDXComponent=!0}}]);