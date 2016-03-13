var ace_mips;
ace.define("ace/mode/mips",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/text_highlight_rules","ace/mode/behaviour"], function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var MipsHighlightRules = function() {

        this.$rules = {
            "start" : [{
                // register operations
                token: function(_a, instr, _b, reg1, _d, reg2, _e, reg3, _c) {
                    return ['','instruction','', 'variable.parameter', 'text', 'variable.parameter', 'text', 'variable.parameter', '']
                },
                regex: /(\s*)(add|addu|and|or|sllv|slt|sltu|srlv|sub|subu|xori|\S+)(\s+)(\$\S+\s*)(,)(\s*\$\S+\s*)(,)(\s*\$\S+\s*)($)/
            }, {
                // intermediate operations
                token: function(_a, instr, _b, reg1, _d, reg2, _e, interm, _c) {
                    return ['', 'instruction', '', 'variable.parameter', 'text', 'variable.parameter', 'text', 'constant.numeric', '']
                },
                regex: /(\s*)(addi|addiu|andi|beq|beql|\S+)(\s+)(\$\S+\s*)(,)(\s*\$\S+\s*)(,)(\s*[0-9]+\s*)($)/
            }, {
                // branch to label operations
                token: function() {
                    return ['','instruction','', 'variable.parameter', 'text', 'variable.parameter', 'text', 'variable.other', '']
                },
                regex: /(\s*)(beq|beql|bgez\S+)(\s+)(\$\S+\s*)(,)(\s*\$\S+\s*)(,)([a-zA-Z]+)($)/
            }, {
                // one register/one label operations
                token: function(_a, instr, _b, reg, comma, label) {
                    return ['', 'instruction', '', 'variable.parameter','text','variable.other', ''];
                },
                regex: /(\s*)(la|bgez|bgezal|bgezl|bgtz|bgtzl|\S*)(\s+)(\$\S+\s*)(,)(\s*[a-z]+)($)/
            }, {
                // load immediate operation
                token: function(instr, _a , reg, comma, interm) {
                    return ['instruction', '', 'variable.parameter', 'text', 'constant.numeric', '']
                },
                regex: /(li|\S*)(\s+)(\$\S+\s*)(,)(\s*[0-9]+)($)/
            }, {
                // label definition
                token: 'variable.other',
                regex: /.*:\s*/
            }, {
                // .ascii[z]
                token: function(ascii, string) {
                    return ['directive.keyword.control', 'string']
                },
                regex: /(.asciiz?\s+)(")/,
                next: "string"
            }, {
                // directive
                token: 'directive.keyword.control',
                regex: /[.]\S*/
            },{
                defaultToken : "text"
            }],
            "string": [{
                token: ['string'],
                regex: /\\"/
            }, {
                token: ['string'],
                regex: /"/,
                next: "start"
            }, {
                defaultToken: "string"
            }]
        };

    };
    oop.inherits(MipsHighlightRules, TextHighlightRules);

    var Mode = function() {
        this.HighlightRules = MipsHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function() {
        // Extra logic goes here. (see below)
    }).call(Mode.prototype);

    exports.Mode = Mode;
    ace_mips = Mode;
});
