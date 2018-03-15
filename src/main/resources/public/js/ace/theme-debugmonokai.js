ace.define("ace/theme/debugmonokai",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-debugmonokai";
exports.cssText = ".ace-debugmonokai .ace_gutter {\
background: #2F3129;\
color: #8F908A\
}\
.ace-debugmonokai .ace_print-margin {\
width: 1px;\
background: #555651\
}\
.ace-debugmonokai {\
background-color: #272822;\
color: #F8F8F2\
}\
.ace-debugmonokai .ace_cursor {\
color: #F8F8F0\
}\
.ace-debugmonokai .ace_marker-layer .ace_selection {\
background: rgb(80, 86, 16);\
margin-top: -5px;\
padding-bottom: 22px;\
border: 1px solid rgba(255,255,255, 0.3)\
}\
.ace-debugmonokai.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #272822;\
}\
.ace-debugmonokai .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-debugmonokai .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #49483E\
}\
.ace-debugmonokai .ace_marker-layer .ace_active-line {\
background: #202020\
}\
.ace-debugmonokai .ace_gutter-active-line {\
background-color: #272727\
}\
.ace-debugmonokai .ace_marker-layer .ace_selected-word {\
border: 1px solid #49483E\
}\
.ace-debugmonokai .ace_invisible {\
color: #52524d\
}\
.ace-debugmonokai .ace_entity.ace_name.ace_tag,\
.ace-debugmonokai .ace_keyword,\
.ace-debugmonokai .ace_meta.ace_tag,\
.ace-debugmonokai .ace_storage {\
color: #F92672\
}\
.ace-debugmonokai .ace_punctuation,\
.ace-debugmonokai .ace_punctuation.ace_tag {\
color: #fff\
}\
.ace-debugmonokai .ace_constant.ace_character,\
.ace-debugmonokai .ace_constant.ace_language,\
.ace-debugmonokai .ace_constant.ace_numeric,\
.ace-debugmonokai .ace_constant.ace_other {\
color: #AE81FF\
}\
.ace-debugmonokai .ace_invalid {\
color: #F8F8F0;\
background-color: #F92672\
}\
.ace-debugmonokai .ace_invalid.ace_deprecated {\
color: #F8F8F0;\
background-color: #AE81FF\
}\
.ace-debugmonokai .ace_support.ace_constant,\
.ace-debugmonokai .ace_support.ace_function {\
color: #66D9EF\
}\
.ace-debugmonokai .ace_fold {\
background-color: #A6E22E;\
border-color: #F8F8F2\
}\
.ace-debugmonokai .ace_storage.ace_type,\
.ace-debugmonokai .ace_support.ace_class,\
.ace-debugmonokai .ace_support.ace_type {\
font-style: italic;\
color: #66D9EF\
}\
.ace-debugmonokai .ace_entity.ace_name.ace_function,\
.ace-debugmonokai .ace_entity.ace_other,\
.ace-debugmonokai .ace_entity.ace_other.ace_attribute-name,\
.ace-debugmonokai .ace_variable {\
color: #A6E22E\
}\
.ace-debugmonokai .ace_variable.ace_parameter {\
font-style: italic;\
color: #FD971F\
}\
.ace-debugmonokai .ace_string {\
color: #E6DB74\
}\
.ace-debugmonokai .ace_comment {\
color: #75715E\
}\
.ace-debugmonokai .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC) right repeat-y\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
