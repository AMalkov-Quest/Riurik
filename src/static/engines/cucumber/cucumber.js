var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}

require.paths = [];
require.modules = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        var y = cwd || '.';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = Object_keys(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

require.define = function (filename, fn) {
    var dirname = require._core[filename]
        ? ''
        : require.modules.path().dirname(filename)
    ;
    
    var require_ = function (file) {
        return require(file, dirname)
    };
    require_.resolve = function (name) {
        return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    var module_ = { exports : {} };
    
    require.modules[filename] = function () {
        require.modules[filename]._cached = module_.exports;
        fn.call(
            module_.exports,
            require_,
            module_,
            module_.exports,
            dirname,
            filename
        );
        require.modules[filename]._cached = module_.exports;
        return module_.exports;
    };
};

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = function (fn) {
    setTimeout(fn, 0);
};

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

require.define("path", function (require, module, exports, __dirname, __filename) {
    function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("/node_modules/cucumber-html/package.json", function (require, module, exports, __dirname, __filename) {
    module.exports = {"main":"./src/main/resources/cucumber/formatter/formatter"}
});

require.define("/node_modules/cucumber-html/src/main/resources/cucumber/formatter/formatter.js", function (require, module, exports, __dirname, __filename) {
    var CucumberHTML = {};

CucumberHTML.DOMFormatter = function(rootNode) {
  var currentUri;
  var currentFeature;
  var currentElement;
  var currentSteps;

  var currentStepIndex;
  var currentStep;
  var $templates = $(CucumberHTML.templates);

  this.uri = function(uri) {
    currentUri = uri;
  };

  this.feature = function(feature) {
    currentFeature = blockElement(rootNode, feature, 'feature');
  };

  this.background = function(background) {
    currentElement = featureElement(background, 'background');
    currentStepIndex = 1;
  };

  this.scenario = function(scenario) {
    currentElement = featureElement(scenario, 'scenario');
    currentStepIndex = 1;
  };

  this.scenarioOutline = function(scenarioOutline) {
    currentElement = featureElement(scenarioOutline, 'scenario_outline');
    currentStepIndex = 1;
  };

  this.step = function(step) {
    var stepElement = $('.step', $templates).clone();
    stepElement.appendTo(currentSteps);
    populate(stepElement, step, 'step');

    if (step.doc_string) {
      docString = $('.doc_string', $templates).clone();
      docString.appendTo(stepElement);
      // TODO: use a syntax highlighter based on the content_type
      docString.text(step.doc_string.value);
    }
    if (step.rows) {
      dataTable = $('.data_table', $templates).clone();
      dataTable.appendTo(stepElement);
      var tBody = dataTable.find('tbody');
      $.each(step.rows, function(index, row) {
        var tr = $('<tr></tr>').appendTo(tBody);
        $.each(row.cells, function(index, cell) {
          var td = $('<td>' + cell + '</td>').appendTo(tBody);
        });
      });
    }
  };

  this.examples = function(examples) {
    var examplesElement = blockElement(currentElement.children('details'), examples, 'examples');
    var examplesTable = $('.examples_table', $templates).clone();
    examplesTable.appendTo(examplesElement.children('details'));

    $.each(examples.rows, function(index, row) {
      var parent = index == 0 ? examplesTable.find('thead') : examplesTable.find('tbody');
      var tr = $('<tr></tr>').appendTo(parent);
      $.each(row.cells, function(index, cell) {
        var td = $('<td>' + cell + '</td>').appendTo(tr);
      });
    });
  };

  this.match = function(match) {
    currentStep = currentSteps.find('li:nth-child(' + currentStepIndex + ')');
    currentStepIndex++;
  };

  this.result = function(result) {
    currentStep.addClass(result.status);
    currentElement.addClass(result.status);
    var isLastStep = currentSteps.find('li:nth-child(' + currentStepIndex + ')').length == 0;
    if(isLastStep) {
      if(currentSteps.find('.failed').length == 0) {
        // No failed steps. Collapse it.
        currentElement.find('details').removeAttr('open');
      }
    }
  };

  this.embedding = function(mimeType, data) {
    if(mimeType.match(/^image\//)) {
      currentStep.append("<div><img src='" + data + "'></div>");
    }
  }

  function featureElement(statement, itemtype) {
    var e = blockElement(currentFeature.children('details'), statement, itemtype);

    currentSteps = $('.steps', $templates).clone();
    currentSteps.appendTo(e.children('details'));

    return e;
  }

  function blockElement(parent, statement, itemtype) {
    var e = $('.blockelement', $templates).clone();
    e.appendTo(parent);
    return populate(e, statement, itemtype);
  }

  function populate(e, statement, itemtype) {
    populateTags(e, statement.tags);
    populateComments(e, statement.comments);
    e.find('.keyword').text(statement.keyword);
    e.find('.name').text(statement.name);
    e.find('.description').text(statement.description);
    e.attr('itemtype', 'http://cukes.info/microformat/' + itemtype);
    e.addClass(itemtype);
    return e;
  }

  function populateComments(e, comments) {
    if (comments !== undefined) {
      var commentsNode = $('.comments', $templates).clone().prependTo(e.find('.header'));
      $.each(comments, function(index, comment) {
        var commentNode = $('.comment', $templates).clone().appendTo(commentsNode);
        commentNode.text(comment.value);
      });
    }
  }

  function populateTags(e, tags) {
    if (tags !== undefined) {
      var tagsNode = $('.tags', $templates).clone().prependTo(e.find('.header'));
      $.each(tags, function(index, tag) {
        var tagNode = $('.tag', $templates).clone().appendTo(tagsNode);
        tagNode.text(tag.name);
      });
    }
  }
};

CucumberHTML.templates = '<div>\
  <section class="blockelement" itemscope>\
    <details open>\
      <summary class="header">\
        <span class="keyword" itemprop="keyword">Keyword</span>: <span itemprop="name" class="name">This is the block name</span>\
      </summary>\
      <div itemprop="description" class="description">The description goes here</div>\
    </details>\
  </section>\
\
  <ol class="steps"></ol>\
\
  <ol>\
    <li class="step"><span class="keyword" itemprop="keyword">Keyword</span><span class="name" itemprop="name">Name</span></li>\
  </ol>\
\
  <pre class="doc_string"></pre>\
\
  <table class="data_table">\
    <tbody>\
    </tbody>\
  </table>\
\
  <table class="examples_table">\
    <thead></thead>\
    <tbody></tbody>\
  </table>\
\
  <section class="embed">\
    <img itemprop="screenshot" class="screenshot" />\
  </section>\
  <div class="tags"></div>\
  <span class="tag"></span>\
  <div class="comments"></div>\
  <div class="comment"></div>\
<div>';

if (typeof module !== 'undefined') {
  module.exports = CucumberHTML;
}
});

require.define("/cucumber.js", function (require, module, exports, __dirname, __filename) {
    var Cucumber = function(featureSource, supportCodeInitializer, options) {
  var configuration = Cucumber.VolatileConfiguration(featureSource, supportCodeInitializer, options);
  var runtime       = Cucumber.Runtime(configuration);
  return runtime;
};
Cucumber.Ast                   = require('./cucumber/ast');
// browserify won't load ./cucumber/cli and throw an exception:
try { Cucumber.Cli             = require('./cucumber/cli'); } catch(e) {}
Cucumber.Debug                 = require('./cucumber/debug'); // Untested namespace
Cucumber.Listener              = require('./cucumber/listener');
Cucumber.Parser                = require('./cucumber/parser');
Cucumber.Runtime               = require('./cucumber/runtime');
Cucumber.SupportCode           = require('./cucumber/support_code');
Cucumber.TagGroupParser        = require('./cucumber/tag_group_parser');
Cucumber.Type                  = require('./cucumber/type');
Cucumber.Util                  = require('./cucumber/util');
Cucumber.VolatileConfiguration = require('./cucumber/volatile_configuration');

Cucumber.VERSION               = "0.2.15";

module.exports                 = Cucumber;

});

require.define("/cucumber/ast.js", function (require, module, exports, __dirname, __filename) {
    var Ast        = {};
Ast.Assembler  = require('./ast/assembler');
Ast.Background = require('./ast/background');
Ast.DataTable  = require('./ast/data_table');
Ast.DocString  = require('./ast/doc_string');
Ast.Feature    = require('./ast/feature');
Ast.Features   = require('./ast/features');
Ast.Filter     = require('./ast/filter');
Ast.Scenario   = require('./ast/scenario');
Ast.Step       = require('./ast/step');
Ast.Tag        = require('./ast/tag');
module.exports = Ast;

});

require.define("/cucumber/ast/assembler.js", function (require, module, exports, __dirname, __filename) {
    var Assembler = function(features, filter) {
  var currentFeature, currentScenarioOrBackground, currentStep;
  var stashedTags = [];

  var self = {
    setCurrentFeature: function setCurrentFeature(feature) {
      currentFeature = feature;
      self.setCurrentScenarioOrBackground(undefined);
    },

    getCurrentFeature: function getCurrentFeature() {
      return currentFeature;
    },

    setCurrentScenarioOrBackground: function setCurrentScenarioOrBackground(scenarioOrBackground) {
      currentScenarioOrBackground = scenarioOrBackground;
      self.setCurrentStep(undefined);
    },

    getCurrentScenarioOrBackground: function getCurrentScenarioOrBackground() {
      return currentScenarioOrBackground;
    },

    setCurrentStep: function setCurrentStep(step) {
      currentStep = step;
    },

    getCurrentStep: function getCurrentStep() {
      return currentStep;
    },

    stashTag: function stashTag(tag) {
      stashedTags.push(tag);
    },

    revealTags: function revealTags() {
      var revealedTags = stashedTags;
      stashedTags      = [];
      return revealedTags;
    },

    applyCurrentFeatureTagsToElement: function applyCurrentFeatureTagsToElement(element) {
      var currentFeature = self.getCurrentFeature();
      var featureTags    = currentFeature.getTags();
      element.addTags(featureTags);
    },

    applyStashedTagsToElement: function applyStashedTagsToElement(element) {
      var revealedTags = self.revealTags();
      element.addTags(revealedTags);
    },

    insertBackground: function insertBackground(background) {
      self.setCurrentScenarioOrBackground(background);
      var currentFeature = self.getCurrentFeature();
      currentFeature.addBackground(background);
    },

    insertDataTableRow: function insertDataTableRow(dataTableRow) {
      var currentStep = self.getCurrentStep();
      currentStep.attachDataTableRow(dataTableRow);
    },

    insertDocString: function insertDocString(docString) {
      var currentStep = self.getCurrentStep();
      currentStep.attachDocString(docString);
    },

    insertFeature: function insertFeature(feature) {
      self.applyStashedTagsToElement(feature);
      self.setCurrentFeature(feature);
      features.addFeature(feature);
    },

    insertScenario: function insertScenario(scenario) {
      self.applyCurrentFeatureTagsToElement(scenario);
      self.applyStashedTagsToElement(scenario);
      self.setCurrentScenarioOrBackground(scenario);
      if (filter.isScenarioEnrolled(scenario)) {
        var currentFeature = self.getCurrentFeature();
        currentFeature.addScenario(scenario);
      }
    },

    insertStep: function insertStep(step) {
      self.setCurrentStep(step);
      var currentScenarioOrBackground = self.getCurrentScenarioOrBackground();
      currentScenarioOrBackground.addStep(step);
    },

    insertTag: function insertTag(tag) {
      self.stashTag(tag);
    }
  };
  return self;
};

module.exports = Assembler;

});

require.define("/cucumber/ast/background.js", function (require, module, exports, __dirname, __filename) {
    var Background = function(keyword, name, description, line) {
  var Cucumber = require('../../cucumber');

  var steps = Cucumber.Type.Collection();

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getDescription: function getDescription() {
      return description;
    },

    getLine: function getLine() {
      return line;
    },

    addStep: function addStep(step) {
      var lastStep = self.getLastStep();
      step.setPreviousStep(lastStep);
      steps.add(step);
 	  },

    getLastStep: function getLastStep() {
      return steps.getLast();
    },

 	  getSteps: function getSteps() {
      return steps;
 	  }
  };
  return self;
};
module.exports = Background;

});

require.define("/cucumber/ast/data_table.js", function (require, module, exports, __dirname, __filename) {
    var DataTable  = function() {
  var Cucumber = require('../../cucumber');

  var rows = Cucumber.Type.Collection();

  var self = {
    attachRow: function attachRow(row) {
      rows.add(row);
    },

    getContents: function getContents() {
      return self;
    },

    raw: function raw() {
      rawRows = [];
      rows.syncForEach(function(row) {
        var rawRow = row.raw();
        rawRows.push(rawRow);
      });
      return rawRows;
    },

    hashes: function hashes() {
      var raw              = self.raw();
      var hashDataTable    = Cucumber.Type.HashDataTable(raw);
      var rawHashDataTable = hashDataTable.raw();
      return rawHashDataTable;
    }
  };
  return self;
};
DataTable.Row  = require('./data_table/row');
module.exports = DataTable;

});

require.define("/cucumber/ast/data_table/row.js", function (require, module, exports, __dirname, __filename) {
    var Row = function(cells, line) {
  var Cucumber = require('../../../cucumber');

  self = {
    raw: function raw() {
      return cells;
    }
  };
  return self;
}
module.exports = Row;

});

require.define("/cucumber/ast/doc_string.js", function (require, module, exports, __dirname, __filename) {
    var DocString = function(contentType, contents, line) {
  var self = {
    getContents: function getContents() {
      return contents;
    },

    getContentType: function getContentType() {
      return contentType;
    },

    getLine: function getLine() {
      return line;
    }
  };
  return self;
};
module.exports = DocString;

});

require.define("/cucumber/ast/feature.js", function (require, module, exports, __dirname, __filename) {
    var Feature = function(keyword, name, description, line) {
  var Cucumber = require('../../cucumber');

  var background;
  var scenarios = Cucumber.Type.Collection();
  var tags      = [];

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getDescription: function getDescription() {
      return description;
    },

    getLine: function getLine() {
      return line;
    },

    addBackground: function addBackground(newBackground) {
      background = newBackground;
    },

    getBackground: function getBackground() {
      return background;
    },

    hasBackground: function hasBackground() {
      return (typeof(background) != 'undefined');
    },

    addScenario: function addScenario(scenario) {
      var background = self.getBackground();
      scenario.setBackground(background);
      scenarios.add(scenario);
    },

    getLastScenario: function getLastScenario() {
      return scenarios.getLast();
    },

    addTags: function setTags(newTags) {
      tags = tags.concat(newTags);
    },

    getTags: function getTags() {
      return tags;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.instructVisitorToVisitBackground(visitor, function() {
        self.instructVisitorToVisitScenarios(visitor, callback);
      });
    },

    instructVisitorToVisitBackground: function instructVisitorToVisitBackground(visitor, callback) {
      if (self.hasBackground()) {
        var background = self.getBackground();
        visitor.visitBackground(background, callback);
      } else {
        callback();
      }
    },

    instructVisitorToVisitScenarios: function instructVisitorToVisitScenarios(visitor, callback) {
      scenarios.forEach(function(scenario, iterate) {
        visitor.visitScenario(scenario, iterate);
      }, callback);
    }
  };
  return self;
};
module.exports = Feature;

});

require.define("/cucumber/ast/features.js", function (require, module, exports, __dirname, __filename) {
    var Features = function() {
  var Cucumber = require('../../cucumber');

  var features = Cucumber.Type.Collection();

  var self = {
    addFeature: function addFeature(feature) {
      features.add(feature);
    },

    getLastFeature: function getLastFeature() {
      return features.getLast();
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      features.forEach(function(feature, iterate) {
        visitor.visitFeature(feature, iterate);
      }, callback);
    }
  };
  return self;
};
module.exports = Features;

});

require.define("/cucumber/ast/filter.js", function (require, module, exports, __dirname, __filename) {
    var _ = require('underscore');

var Filter = function(rules) {
  var self = {
    isScenarioEnrolled: function isScenarioEnrolled(scenario) {
      var enrolled = _.all(rules, function(rule) {
        return rule.isSatisfiedByElement(scenario);
      });
      return enrolled;
    }
  };
  return self;
};
Filter.AnyOfTagsRule          = require('./filter/any_of_tags_rule');
Filter.ElementMatchingTagSpec = require('./filter/element_matching_tag_spec');
module.exports = Filter;
});

require.define("/node_modules/underscore/package.json", function (require, module, exports, __dirname, __filename) {
    module.exports = {"main":"underscore.js"}
});

require.define("/node_modules/underscore/underscore.js", function (require, module, exports, __dirname, __filename) {
    //     Underscore.js 1.2.2
//     (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js** and **"CommonJS"**, with
  // backwards-compatibility for the old `require()` API. If we're not in
  // CommonJS, add `_` to the global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else if (typeof define === 'function' && define.amd) {
    // Register as a named module with AMD.
    define('underscore', function() {
      return _;
    });
  } else {
    // Exported as a string, for Closure Compiler "advanced" mode.
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.2.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = memo !== void 0;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError("Reduce of empty array with no initial value");
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
    return _.reduce(reversed, iterator, memo, context);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (method.call ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      if (index == 0) {
        shuffled[0] = value;
      } else {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      }
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var result = [];
    _.reduce(initial, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
        memo[memo.length] = el;
        result[result.length] = array[i];
      }
      return memo;
    }, []);
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and another.
  // Only the elements present in just the first array will remain.
  _.difference = function(array, other) {
    return _.filter(array, function(value){ return !_.include(other, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        func.apply(context, args);
      }
      whenDone();
      throttling = true;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = slice.call(arguments);
    return function() {
      var args = slice.call(arguments);
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (_.isFunction(a.isEqual)) return a.isEqual(b);
    if (_.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return String(a) == String(b);
      case '[object Number]':
        a = +a;
        b = +b;
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != a ? b != b : (a == 0 ? 1 / a == 1 / b : a == b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ("constructor" in a != "constructor" in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (hasOwnProperty.call(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = hasOwnProperty.call(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (hasOwnProperty.call(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  if (toString.call(arguments) == '[object Arguments]') {
    _.isArguments = function(obj) {
      return toString.call(obj) == '[object Arguments]';
    };
  } else {
    _.isArguments = function(obj) {
      return !!(obj && hasOwnProperty.call(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.escape, function(match, code) {
           return "',_.escape(" + code.replace(/\\'/g, "'") + "),'";
         })
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ') + ";__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', '_', tmpl);
    return data ? func(data, _) : function(data) { return func(data, _) };
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

});

require.define("/cucumber/ast/filter/any_of_tags_rule.js", function (require, module, exports, __dirname, __filename) {
    var _ = require('underscore');

var AnyOfTagsRule = function(tags) {
  var Cucumber = require('../../../cucumber');

  var self = {
    isSatisfiedByElement: function isSatisfiedByElement(element) {
      var satisfied = _.any(tags, function(tag) {
        var spec = Cucumber.Ast.Filter.ElementMatchingTagSpec(tag);
        return spec.isMatching(element);
      });
      return satisfied;
    }
  };
  return self;
};
module.exports = AnyOfTagsRule;

});

require.define("/cucumber/ast/filter/element_matching_tag_spec.js", function (require, module, exports, __dirname, __filename) {
    var _ = require('underscore');

var ElementMatchingTagSpec = function(tagName) {
  var self = {
    isMatching: function isMatching(element) {
      var elementTags = element.getTags();
      var matching;
      if (self.isExpectingTag())
        matching = _.any(elementTags, self.isTagSatisfying);
      else
        matching = _.all(elementTags, self.isTagSatisfying);
      return matching;
    },

    isTagSatisfying: function isTagSatisfying(tag) {
      var checkedTagName = tag.getName();
      var satisfying;
      if (self.isExpectingTag())
        satisfying = checkedTagName == tagName;
      else {
        var negatedCheckedTagName = ElementMatchingTagSpec.NEGATION_CHARACTER + checkedTagName;
        satisfying = negatedCheckedTagName != tagName;
      }
      return satisfying;
    },

    isExpectingTag: function isExpectingTag() {
      var expectingTag = tagName[0] != ElementMatchingTagSpec.NEGATION_CHARACTER;
      return expectingTag;
    }
  };
  return self;
};
ElementMatchingTagSpec.NEGATION_CHARACTER = '~';
module.exports = ElementMatchingTagSpec;

});

require.define("/cucumber/ast/scenario.js", function (require, module, exports, __dirname, __filename) {
    var Scenario = function(keyword, name, description, line) {
  var Cucumber = require('../../cucumber');

  var background;
  var steps = Cucumber.Type.Collection();
  var tags  = [];

  var self = {
    setBackground: function setBackground(newBackground) {
      background = newBackground;
    },

    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getDescription: function getDescription() {
      return description;
    },

    getLine: function getLine() {
      return line;
    },

    getBackground: function getBackground() {
      return background;
    },

    addStep: function addStep(step) {
      var lastStep = self.getLastStep();
      step.setPreviousStep(lastStep);
      steps.add(step);
    },

    getLastStep: function getLastStep() {
      return steps.getLast();
    },

    addTags: function setTags(newTags) {
      tags = tags.concat(newTags);
    },

    getTags: function getTags() {
      return tags;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.instructVisitorToVisitBackgroundSteps(visitor, function() {
        self.instructVisitorToVisitScenarioSteps(visitor, callback);
      });
    },

    instructVisitorToVisitBackgroundSteps: function instructVisitorToVisitBackgroundSteps(visitor, callback) {
      var background = self.getBackground();
      if (typeof(background) != 'undefined') {
        var steps = background.getSteps();
        self.instructVisitorToVisitSteps(visitor, steps, callback);
      } else {
        callback();
      }
    },

    instructVisitorToVisitScenarioSteps: function instructVisitorToVisitScenarioSteps(visitor, callback) {
      self.instructVisitorToVisitSteps(visitor, steps, callback);
    },

    instructVisitorToVisitSteps: function instructVisitorToVisitSteps(visitor, steps, callback) {
      steps.forEach(function(step, iterate) {
        visitor.visitStep(step, iterate);
      }, callback);
    }
  };
  return self;
};
module.exports = Scenario;

});

require.define("/cucumber/ast/step.js", function (require, module, exports, __dirname, __filename) {
    var Step = function(keyword, name, line) {
  var Cucumber = require('../../cucumber');
  var docString, dataTable, previousStep;

  var self = {
    setPreviousStep: function setPreviousStep(newPreviousStep) {
      previousStep = newPreviousStep;
    },

    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getLine: function getLine() {
      return line;
    },

    getPreviousStep: function getPreviousStep() {
      return previousStep;
    },

    hasPreviousStep: function hasPreviousStep() {
      return !!previousStep;
    },

    getAttachment: function getAttachment() {
      var attachment;
      if (self.hasDocString()) {
        attachment = self.getDocString();
      } else if (self.hasDataTable()) {
        attachment = self.getDataTable();
      }
      return attachment;
    },

    getAttachmentContents: function getAttachmentContents() {
      var attachment         = self.getAttachment();
      var attachmentContents;
      if (attachment)
        attachmentContents = attachment.getContents();
      return attachmentContents;
    },

    getDocString: function getDocString() { return docString; },

    getDataTable: function getDataTable() { return dataTable; },

    hasAttachment: function hasAttachment() {
      return self.hasDocString() || self.hasDataTable();
    },

    hasDocString: function hasDocString() {
      return !!docString;
    },

    hasDataTable: function hasDataTable() {
      return !!dataTable;
    },

    attachDocString: function attachDocString(_docString) { docString = _docString; },

    attachDataTable: function attachDataTable(_dataTable) { dataTable = _dataTable; },

    attachDataTableRow: function attachDataTableRow(row) {
      self.ensureDataTableIsAttached();
      var dataTable = self.getDataTable();
      dataTable.attachRow(row);
    },

    ensureDataTableIsAttached: function ensureDataTableIsAttached() {
      var dataTable = self.getDataTable();
      if (!dataTable) {
        dataTable = Cucumber.Ast.DataTable();
        self.attachDataTable(dataTable);
      }
    },

    isOutcomeStep: function isOutcomeStep() {
      var isOutcomeStep =
        self.hasOutcomeStepKeyword() || self.isRepeatingOutcomeStep();
      return isOutcomeStep;
    },

    isEventStep: function isEventStep() {
      var isEventStep =
        self.hasEventStepKeyword() || self.isRepeatingEventStep();
      return isEventStep;
    },

    hasOutcomeStepKeyword: function hasOutcomeStepKeyword() {
      var hasOutcomeStepKeyword =
        keyword == Step.OUTCOME_STEP_KEYWORD;
      return hasOutcomeStepKeyword;
    },

    hasEventStepKeyword: function hasEventStepKeyword() {
      var hasEventStepKeyword =
        keyword == Step.EVENT_STEP_KEYWORD;
      return hasEventStepKeyword;
    },

    isRepeatingOutcomeStep: function isRepeatingOutcomeStep() {
      var isRepeatingOutcomeStep =
        self.hasRepeatStepKeyword() && self.isPrecededByOutcomeStep();
      return isRepeatingOutcomeStep;
    },

    isRepeatingEventStep: function isRepeatingEventStep() {
      var isRepeatingEventStep =
        self.hasRepeatStepKeyword() && self.isPrecededByEventStep();
      return isRepeatingEventStep;
    },

    hasRepeatStepKeyword: function hasRepeatStepKeyword() {
      var hasRepeatStepKeyword =
        keyword == Step.AND_STEP_KEYWORD || keyword == Step.BUT_STEP_KEYWORD || keyword == Step.STAR_STEP_KEYWORD;
      return hasRepeatStepKeyword;
    },

    isPrecededByOutcomeStep: function isPrecededByOutcomeStep() {
      var isPrecededByOutcomeStep = false;

      if (self.hasPreviousStep()) {
        var previousStep            = self.getPreviousStep();
        var isPrecededByOutcomeStep = previousStep.isOutcomeStep();
      }
      return isPrecededByOutcomeStep;
    },

    isPrecededByEventStep: function isPrecededByEventStep() {
      var isPrecededByEventStep = false;

      if (self.hasPreviousStep()) {
        var previousStep          = self.getPreviousStep();
        var isPrecededByEventStep = previousStep.isEventStep();
      }
      return isPrecededByEventStep;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.execute(visitor, function(stepResult) {
        visitor.visitStepResult(stepResult, callback);
      });
    },

    execute: function execute(visitor, callback) {
      var stepDefinition = visitor.lookupStepDefinitionByName(name);
      var world          = visitor.getWorld();
      stepDefinition.invoke(self, world, callback);
    }
  };
  return self;
};
Step.EVENT_STEP_KEYWORD   = 'When ';
Step.OUTCOME_STEP_KEYWORD = 'Then ';
Step.AND_STEP_KEYWORD     = 'And ';
Step.BUT_STEP_KEYWORD     = 'But ';
Step.STAR_STEP_KEYWORD    = '* ';
module.exports = Step;

});

require.define("/cucumber/ast/tag.js", function (require, module, exports, __dirname, __filename) {
    var Tag = function(name, line) {
  var Cucumber = require('../../cucumber');

  var self = {
    getName: function getName() {
      return name;
    }
  };
  return self;
};
module.exports = Tag;
});

require.define("/cucumber/debug.js", function (require, module, exports, __dirname, __filename) {
    var Debug = {
  TODO: function TODO(description) {
    return function() { throw(new Error("IMPLEMENT ME: " + description)); };
  },

  warn: function warn(string, caption, level) {
    if (Debug.isMessageLeveltoBeDisplayed(level))
      process.stdout.write(Debug.warningString(string, caption));
  },

  notice: function notice(string, caption, level) {
    if (Debug.isMessageLeveltoBeDisplayed(level))
      process.stdout.write(Debug.noticeString(string, caption));
  },

  warningString: function warningString(string, caption) {
    caption = caption || 'debug-warning';
    return "\033[30;43m" + caption + ":\033[0m \033[33m" + string + "\033[0m"
  },

  noticeString: function noticeString(string, caption) {
    caption = caption || 'debug-notice';
    return "\033[30;46m" + caption + ":\033[0m \033[36m" + string + "\033[0m"
  },

  prefix: function prefix() {
    return ;
  },

  isMessageLeveltoBeDisplayed: function isMessageLeveltoBeDisplayed(level) {
    if (process.env) {
      level = level || 3; // default level
      return (level <= process.env['DEBUG_LEVEL']);
    } else {
      return false;
    }
  }
};
Debug.SimpleAstListener = require('./debug/simple_ast_listener');
module.exports          = Debug;

});

require.define("/cucumber/debug/simple_ast_listener.js", function (require, module, exports, __dirname, __filename) {
    var SimpleAstListener = function(options) {
  var logs                        = '';
  var failed                      = false;
  var beforeEachScenarioCallbacks = [];
  var currentStep;

  if (!options)
    var options = {};

  var self = {
    hear: function hear(event, callback) {
      switch(event.getName()) {
      case 'BeforeFeature':
        self.hearBeforeFeature(event.getPayloadItem('feature'), callback);
        break;
      case 'BeforeScenario':
        self.hearBeforeScenario(event.getPayloadItem('scenario'), callback);
        break;
      case 'BeforeStep':
        self.hearBeforeStep(event.getPayloadItem('step'), callback);
        break;
      case 'StepResult':
        self.hearStepResult(event.getPayloadItem('stepResult'), callback);
        break;
      default:
        callback();
      }
    },

    hearBeforeFeature: function hearBeforeFeature(feature, callback) {
      log("Feature: " + feature.getName());
      var description = feature.getDescription();
      if (description != "")
        log(description, 1);
      callback();
    },

    hearBeforeScenario: function hearBeforeScenario(scenario, callback) {
      beforeEachScenarioCallbacks.forEach(function(func) {
        func();
      });
      log("");
      log(scenario.getKeyword() + ": " + scenario.getName(), 1);
      callback();
    },

    hearBeforeStep: function hearBeforeStep(step, callback) {
      currentStep = step;
      callback();
    },

    hearStepResult: function hearStepResult(stepResult, callback) {
      log(currentStep.getKeyword() + currentStep.getName(), 2);
      if (currentStep.hasDocString()) {
        log('"""', 3);
        log(currentStep.getDocString().getContents(), 3);
        log('"""', 3);
      };
      callback();
    },

    getLogs: function getLogs() {
      return logs;
    },

    featuresPassed: function featuresPassed() {
      return !failed;
    },

    beforeEachScenarioDo: function beforeEachScenarioDo(func) {
      beforeEachScenarioCallbacks.push(func);
    }
  };
  return self;

  function log(message, indentation) {
    if (indentation)
      message = indent(message, indentation);
    logs = logs + message + "\n";
    if (options['logToConsole'])
      console.log(message);
    if (typeof(options['logToFunction']) == 'function')
      options['logToFunction'](message);
  };

  function indent(text, indentation) {
    var indented;
    text.split("\n").forEach(function(line) {
      var prefix = new Array(indentation + 1).join("  ");
      line = prefix + line;
      indented = (typeof(indented) == 'undefined' ? line : indented + "\n" + line);
    });
    return indented;
  };
};
module.exports = SimpleAstListener;

});

require.define("/cucumber/listener.js", function (require, module, exports, __dirname, __filename) {
    var Listener               = {};
Listener.ProgressFormatter = require('./listener/progress_formatter');
module.exports             = Listener;

});

require.define("/cucumber/listener/progress_formatter.js", function (require, module, exports, __dirname, __filename) {
    var ProgressFormatter = function(options) {
  var Cucumber = require('../../cucumber');

  var logs                     = "";
  var failedScenarioLogBuffer  = "";
  var undefinedStepLogBuffer   = "";
  var passedScenarioCount      = 0;
  var undefinedScenarioCount   = 0;
  var pendingScenarioCount     = 0;
  var failedScenarioCount      = 0;
  var passedStepCount          = 0;
  var failedStepCount          = 0;
  var skippedStepCount         = 0;
  var undefinedStepCount       = 0;
  var pendingStepCount         = 0;
  var currentScenarioFailing   = false;
  var currentScenarioUndefined = false;
  var currentScenarioPending   = false;
  var failedStepResults        = Cucumber.Type.Collection();

  if (!options)
    options = {};
  if (options['logToConsole'] == undefined)
    options['logToConsole'] = true;
  var self = {
    log: function log(string) {
      logs += string;
      if (options['logToConsole'])
        process.stdout.write(string);
      if (typeof(options['logToFunction']) == 'function')
        options['logToFunction'](string);
    },

    getLogs: function getLogs() {
      return logs;
    },

    hear: function hear(event, callback) {
      if (self.hasHandlerForEvent(event)) {
        var handler = self.getHandlerForEvent(event);
        handler(event, callback);
      } else {
        callback();
      }
    },

    hasHandlerForEvent: function hasHandlerForEvent(event) {
      var handlerName = self.buildHandlerNameForEvent(event);
      return self[handlerName] != undefined;
    },

    buildHandlerNameForEvent: function buildHandlerNameForEvent(event) {
      var handlerName =
        ProgressFormatter.EVENT_HANDLER_NAME_PREFIX +
        event.getName() +
        ProgressFormatter.EVENT_HANDLER_NAME_SUFFIX;
      return handlerName;
    },

    getHandlerForEvent: function getHandlerForEvent(event) {
      var eventHandlerName = self.buildHandlerNameForEvent(event);
      return self[eventHandlerName];
    },

    handleBeforeScenarioEvent: function handleBeforeScenarioEvent(event, callback) {
      self.prepareBeforeScenario();
      callback();
    },

    handleStepResultEvent: function handleStepResult(event, callback) {
      var stepResult = event.getPayloadItem('stepResult');
      if (stepResult.isSuccessful())
        self.handleSuccessfulStepResult();
      else if (stepResult.isPending())
        self.handlePendingStepResult();
      else if (stepResult.isSkipped())
        self.handleSkippedStepResult();
      else if (stepResult.isUndefined())
        self.handleUndefinedStepResult(stepResult);
      else
        self.handleFailedStepResult(stepResult);
      callback();
    },

    handleSuccessfulStepResult: function handleSuccessfulStepResult() {
      self.witnessPassedStep();
      self.log(ProgressFormatter.PASSED_STEP_CHARACTER);
    },

    handlePendingStepResult: function handlePendingStepResult() {
      self.witnessPendingStep();
      self.markCurrentScenarioAsPending();
      self.log(ProgressFormatter.PENDING_STEP_CHARACTER);
    },

    handleSkippedStepResult: function handleSkippedStepResult() {
      self.witnessSkippedStep();
      self.log(ProgressFormatter.SKIPPED_STEP_CHARACTER);
    },

    handleUndefinedStepResult: function handleUndefinedStepResult(stepResult) {
      var step = stepResult.getStep();
      self.storeUndefinedStep(step);
      self.witnessUndefinedStep();
      self.markCurrentScenarioAsUndefined();
      self.log(ProgressFormatter.UNDEFINED_STEP_CHARACTER);
    },

    handleFailedStepResult: function handleFailedStepResult(stepResult) {
      self.storeFailedStepResult(stepResult);
      self.witnessFailedStep();
      self.markCurrentScenarioAsFailing();
      self.log(ProgressFormatter.FAILED_STEP_CHARACTER);
    },

    handleAfterFeaturesEvent: function handleAfterFeaturesEvent(event, callback) {
      self.logSummary();
      callback();
    },

    handleAfterScenarioEvent: function handleAfterScenarioEvent(event, callback) {
      if (self.isCurrentScenarioFailing()) {
        var scenario = event.getPayloadItem('scenario');
        self.storeFailedScenario(scenario);
        self.witnessFailedScenario();
      } else if (self.isCurrentScenarioUndefined()) {
        self.witnessUndefinedScenario();
      } else if (self.isCurrentScenarioPending()) {
        self.witnessPendingScenario();
      } else {
        self.witnessPassedScenario();
      }
      callback();
    },

    prepareBeforeScenario: function prepareBeforeScenario() {
      currentScenarioFailing   = false;
      currentScenarioPending   = false;
      currentScenarioUndefined = false;
    },

    markCurrentScenarioAsFailing: function markCurrentScenarioAsFailing() {
      currentScenarioFailing = true;
    },

    markCurrentScenarioAsUndefined: function markCurrentScenarioAsUndefined() {
      currentScenarioUndefined = true;
    },

    markCurrentScenarioAsPending: function markCurrentScenarioAsPending() {
      currentScenarioPending = true;
    },

    isCurrentScenarioFailing: function isCurrentScenarioFailing() {
      return currentScenarioFailing;
    },

    isCurrentScenarioUndefined: function isCurrentScenarioUndefined() {
      return currentScenarioUndefined;
    },

    isCurrentScenarioPending: function isCurrentScenarioPending() {
      return currentScenarioPending;
    },

    storeFailedStepResult: function storeFailedStepResult(failedStepResult) {
      failedStepResults.add(failedStepResult);
    },

    storeFailedScenario: function storeFailedScenario(failedScenario) {
      var name = failedScenario.getName();
      var line = failedScenario.getLine();
      self.appendStringToFailedScenarioLogBuffer(":" + line + " # Scenario: " + name);
    },

    storeUndefinedStep: function storeUndefinedStep(step) {
      var snippetBuilder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(step);
      var snippet        = snippetBuilder.buildSnippet();
      self.appendStringToUndefinedStepLogBuffer(snippet);
    },

    appendStringToFailedScenarioLogBuffer: function appendStringToFailedScenarioLogBuffer(string) {
      failedScenarioLogBuffer += string + "\n";
    },

    appendStringToUndefinedStepLogBuffer: function appendStringToUndefinedStepLogBuffer(string) {
      if (undefinedStepLogBuffer.indexOf(string) == -1)
        undefinedStepLogBuffer += string + "\n";
    },

    getFailedScenarioLogBuffer: function getFailedScenarioLogBuffer() {
      return failedScenarioLogBuffer;
    },

    getUndefinedStepLogBuffer: function getUndefinedStepLogBuffer() {
      return undefinedStepLogBuffer;
    },

    logSummary: function logSummary() {
      self.log("\n\n");
      if (self.witnessedAnyFailedStep())
        self.logFailedStepResults();
      self.logScenariosSummary();
      self.logStepsSummary();
      if (self.witnessedAnyUndefinedStep())
        self.logUndefinedStepSnippets();
    },

    logFailedStepResults: function logFailedStepResults() {
      self.log("(::) failed steps (::)\n\n");
      failedStepResults.syncForEach(function(stepResult) {
        self.logFailedStepResult(stepResult);
      });
      self.log("Failing scenarios:\n");
      var failedScenarios = self.getFailedScenarioLogBuffer();
      self.log(failedScenarios);
      self.log("\n");
    },

    logFailedStepResult: function logFailedStepResult(stepResult) {
      var failureMessage = stepResult.getFailureException();
      self.log(failureMessage.stack || failureMessage);
      self.log("\n\n");
    },

    logScenariosSummary: function logScenariosSummary() {
      var scenarioCount          = self.getScenarioCount();
      var passedScenarioCount    = self.getPassedScenarioCount();
      var undefinedScenarioCount = self.getUndefinedScenarioCount();
      var pendingScenarioCount   = self.getPendingScenarioCount();
      var failedScenarioCount    = self.getFailedScenarioCount();
      var details                = [];

      self.log(scenarioCount + " scenario" + (scenarioCount != 1 ? "s" : ""));
      if (scenarioCount > 0 ) {
        if (failedScenarioCount > 0)
          details.push(failedScenarioCount + " failed");
        if (undefinedScenarioCount > 0)
          details.push(undefinedScenarioCount + " undefined");
        if (pendingScenarioCount > 0)
          details.push(pendingScenarioCount + " pending");
        if (passedScenarioCount > 0)
          details.push(passedScenarioCount + " passed");
        self.log(" (" + details.join(', ') + ")");
      }
      self.log("\n");
    },

    logStepsSummary: function logStepsSummary() {
      var stepCount          = self.getStepCount();
      var passedStepCount    = self.getPassedStepCount();
      var undefinedStepCount = self.getUndefinedStepCount();
      var skippedStepCount   = self.getSkippedStepCount();
      var pendingStepCount   = self.getPendingStepCount();
      var failedStepCount    = self.getFailedStepCount();
      var details            = [];

      self.log(stepCount + " step" + (stepCount != 1 ? "s" : ""));
      if (stepCount > 0) {
        if (failedStepCount > 0)
          details.push(failedStepCount    + " failed");
        if (undefinedStepCount > 0)
          details.push(undefinedStepCount + " undefined");
        if (pendingStepCount > 0)
          details.push(pendingStepCount   + " pending");
        if (skippedStepCount > 0)
          details.push(skippedStepCount   + " skipped");
        if (passedStepCount > 0)
          details.push(passedStepCount    + " passed");
        self.log(" (" + details.join(', ') + ")");
      }
      self.log("\n");
    },

    logUndefinedStepSnippets: function logUndefinedStepSnippets() {
      var undefinedStepLogBuffer = self.getUndefinedStepLogBuffer();
      self.log("\nYou can implement step definitions for undefined steps with these snippets:\n\n");
      self.log(undefinedStepLogBuffer);
    },

    witnessPassedScenario: function witnessPassedScenario() {
      passedScenarioCount++;
    },

    witnessUndefinedScenario: function witnessUndefinedScenario() {
      undefinedScenarioCount++;
    },

    witnessPendingScenario: function witnessPendingScenario() {
      pendingScenarioCount++;
    },

    witnessFailedScenario: function witnessFailedScenario() {
      failedScenarioCount++;
    },

    witnessPassedStep: function witnessPassedStep() {
      passedStepCount++;
    },

    witnessUndefinedStep: function witnessUndefinedStep() {
      undefinedStepCount++;
    },

    witnessPendingStep: function witnessPendingStep() {
      pendingStepCount++;
    },

    witnessFailedStep: function witnessFailedStep() {
      failedStepCount++;
    },

    witnessSkippedStep: function witnessSkippedStep() {
      skippedStepCount++;
    },

    getScenarioCount: function getScenarioCount() {
      var scenarioCount =
        self.getPassedScenarioCount()    +
        self.getUndefinedScenarioCount() +
        self.getPendingScenarioCount()   +
        self.getFailedScenarioCount();
      return scenarioCount;
    },

    getPassedScenarioCount: function getPassedScenarioCount() {
      return passedScenarioCount;
    },

    getUndefinedScenarioCount: function getUndefinedScenarioCount() {
      return undefinedScenarioCount;
    },

    getPendingScenarioCount: function getPendingScenarioCount() {
      return pendingScenarioCount;
    },

    getFailedScenarioCount: function getFailedScenarioCount() {
      return failedScenarioCount;
    },

    getStepCount: function getStepCount() {
      var stepCount =
        self.getPassedStepCount()    +
        self.getUndefinedStepCount() +
        self.getSkippedStepCount()   +
        self.getPendingStepCount()   +
        self.getFailedStepCount();
      return stepCount;
    },

    getPassedStepCount: function getPassedStepCount() {
      return passedStepCount;
    },

    getPendingStepCount: function getPendingStepCount() {
      return pendingStepCount;
    },

    getFailedStepCount: function getFailedStepCount() {
      return failedStepCount;
    },

    getSkippedStepCount: function getSkippedStepCount() {
      return skippedStepCount;
    },

    getUndefinedStepCount: function getUndefinedStepCount() {
      return undefinedStepCount;
    },

    witnessedAnyFailedStep: function witnessedAnyFailedStep() {
      return failedStepCount > 0;
    },

    witnessedAnyUndefinedStep: function witnessedAnyUndefinedStep() {
      return undefinedStepCount > 0;
    }
  };
  return self;
};
ProgressFormatter.PASSED_STEP_CHARACTER     = '.';
ProgressFormatter.SKIPPED_STEP_CHARACTER    = '-';
ProgressFormatter.UNDEFINED_STEP_CHARACTER  = 'U';
ProgressFormatter.PENDING_STEP_CHARACTER    = 'P';
ProgressFormatter.FAILED_STEP_CHARACTER     = 'F';
ProgressFormatter.EVENT_HANDLER_NAME_PREFIX = 'handle';
ProgressFormatter.EVENT_HANDLER_NAME_SUFFIX = 'Event';
module.exports                              = ProgressFormatter;

});

require.define("/cucumber/parser.js", function (require, module, exports, __dirname, __filename) {
    var Parser = function(featureSources, astFilter) {
  var Gherkin  = require('gherkin');
  var Cucumber = require('../cucumber');

  var features     = Cucumber.Ast.Features();
  var astAssembler = Cucumber.Ast.Assembler(features, astFilter);

  var self = {
    parse: function parse() {
      var Lexer = Gherkin.Lexer('en');
      var lexer = new Lexer(self.getEventHandlers());
      for (i in featureSources) {
        var featureSource = featureSources[i][Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX];
        lexer.scan(featureSource);
      }
      return features;
    },

    getEventHandlers: function getEventHandlers() {
      return {
        background: self.handleBackground,
        comment:    self.handleComment,
        doc_string: self.handleDocString,
        eof:        self.handleEof,
        feature:    self.handleFeature,
        row:        self.handleDataTableRow,
        scenario:   self.handleScenario,
        step:       self.handleStep,
        tag:        self.handleTag
      };
    },

    handleTag: function handleTag(tag, line) {
      var tag = Cucumber.Ast.Tag(tag, line);
      astAssembler.insertTag(tag);
    },

    handleBackground: function handleBackground(keyword, name, description, line) {
      var background = Cucumber.Ast.Background(keyword, name, description, line);
      astAssembler.insertBackground(background);
    },

    handleComment: function handleComment() {},

    handleDocString: function handleDocString(contentType, string, line) {
      var docString = Cucumber.Ast.DocString(contentType, string, line);
      astAssembler.insertDocString(docString);
    },

    handleEof: function handleEof() {},

    handleFeature: function handleFeature(keyword, name, description, line) {
      var feature = Cucumber.Ast.Feature(keyword, name, description, line);
      astAssembler.insertFeature(feature);
    },

    handleDataTableRow: function handleDataTableRow(cells, line) {
      var dataTableRow = Cucumber.Ast.DataTable.Row(cells, line);
      astAssembler.insertDataTableRow(dataTableRow);
    },

    handleScenario: function handleScenario(keyword, name, description, line) {
      var scenario = Cucumber.Ast.Scenario(keyword, name, description, line);
      astAssembler.insertScenario(scenario);
    },

    handleStep: function handleStep(keyword, name, line) {
      var step = Cucumber.Ast.Step(keyword, name, line);
      astAssembler.insertStep(step);
    }
  };
  return self;
};
Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX = 1;
module.exports = Parser;

});

require.define("/node_modules/gherkin/package.json", function (require, module, exports, __dirname, __filename) {
    module.exports = {"main":"./lib/gherkin"}
});

require.define("/node_modules/gherkin/lib/gherkin.js", function (require, module, exports, __dirname, __filename) {
    exports.Lexer = function(lang) {
  return require('./gherkin/lexer/' + lang).Lexer;
};

exports.connect = function(path) {
  var gherkinFiles = require('connect').static(__dirname);

  return function(req, res, next) {
    if(req.url.indexOf(path) == 0) {
      req.url = req.url.slice(path.length);
      gherkinFiles(req, res, next);
    } else {
      next();
    }
  };
};
});

require.define("/cucumber/runtime.js", function (require, module, exports, __dirname, __filename) {
    var Runtime = function(configuration) {
  var Cucumber = require('../cucumber');

  var listeners = Cucumber.Type.Collection();

  var self = {
    start: function start(callback) {
      if (typeof(callback) !== 'function')
        throw new Error(Runtime.START_MISSING_CALLBACK_ERROR);
      var features           = self.getFeatures();
      var supportCodeLibrary = self.getSupportCodeLibrary();
      var astTreeWalker      = Runtime.AstTreeWalker(features, supportCodeLibrary, listeners);
      astTreeWalker.walk(callback);
    },

    attachListener: function attachListener(listener) {
      listeners.add(listener);
    },

    getFeatures: function getFeatures() {
      var featureSources = configuration.getFeatureSources();
      var astFilter      = configuration.getAstFilter();
      var parser         = Cucumber.Parser(featureSources, astFilter);
      var features       = parser.parse();
      return features;
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      var supportCodeLibrary = configuration.getSupportCodeLibrary();
      return supportCodeLibrary;
    }
  };
  return self;
};
Runtime.START_MISSING_CALLBACK_ERROR = "Cucumber.Runtime.start() expects a callback";
Runtime.AstTreeWalker        = require('./runtime/ast_tree_walker');
Runtime.StepResult           = require('./runtime/step_result');
Runtime.SuccessfulStepResult = require('./runtime/successful_step_result');
Runtime.PendingStepResult    = require('./runtime/pending_step_result');
Runtime.FailedStepResult     = require('./runtime/failed_step_result');
Runtime.SkippedStepResult    = require('./runtime/skipped_step_result');
Runtime.UndefinedStepResult  = require('./runtime/undefined_step_result');
module.exports               = Runtime;

});

require.define("/cucumber/runtime/ast_tree_walker.js", function (require, module, exports, __dirname, __filename) {
    var AstTreeWalker = function(features, supportCodeLibrary, listeners) {
  var Cucumber = require('../../cucumber');

  var listeners;
  var world;
  var allFeaturesSucceded = true;
  var skippingSteps       = false;

  var self = {
    walk: function walk(callback) {
      self.visitFeatures(features, function() {
        var featuresResult = self.didAllFeaturesSucceed();
        callback(featuresResult);
      });
    },

    visitFeatures: function visitFeatures(features, callback) {
      var event = AstTreeWalker.Event(AstTreeWalker.FEATURES_EVENT_NAME);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) { features.acceptVisitor(self, callback); },
        callback
      );
    },

    visitFeature: function visitFeature(feature, callback) {
      var payload = { feature: feature };
      var event   = AstTreeWalker.Event(AstTreeWalker.FEATURE_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) { feature.acceptVisitor(self, callback); },
        callback
      );
    },

    visitBackground: function visitBackground(background, callback) {
 	    var payload = { background: background };
 	    var event   = AstTreeWalker.Event(AstTreeWalker.BACKGROUND_EVENT_NAME, payload);
 	    self.broadcastEvent(event, callback);
 	  },

    visitScenario: function visitScenario(scenario, callback) {
      supportCodeLibrary.instantiateNewWorld(function(world) {
        self.setWorld(world);
        self.witnessNewScenario();
        var payload = { scenario: scenario };
        var event   = AstTreeWalker.Event(AstTreeWalker.SCENARIO_EVENT_NAME, payload);
        var hookedUpScenarioVisit = supportCodeLibrary.hookUpFunction(
          function(callback) { scenario.acceptVisitor(self, callback); },
          scenario,
          world
        );
        self.broadcastEventAroundUserFunction(
          event,
          hookedUpScenarioVisit,
          callback
        );
      });
    },

    visitStep: function visitStep(step, callback) {
      var payload = { step: step };
      var event   = AstTreeWalker.Event(AstTreeWalker.STEP_EVENT_NAME, payload);
      self.broadcastEventAroundUserFunction(
        event,
        function(callback) {
          self.processStep(step, callback);
        },
        callback
      );
    },

    visitStepResult: function visitStepResult(stepResult, callback) {
      if (stepResult.isFailed())
        self.witnessFailedStep();
      else if (stepResult.isPending())
        self.witnessPendingStep();
      var payload = { stepResult: stepResult };
      var event   = AstTreeWalker.Event(AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    broadcastEventAroundUserFunction: function broadcastEventAroundUserFunction(event, userFunction, callback) {
      var userFunctionWrapper = self.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      self.broadcastBeforeEvent(event, userFunctionWrapper);
    },

    wrapUserFunctionAndAfterEventBroadcast: function wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback) {
      var callAfterEventBroadcast = self.wrapAfterEventBroadcast(event, callback);
      return function callUserFunctionAndBroadcastAfterEvent() {
        userFunction(callAfterEventBroadcast);
      };
    },

    wrapAfterEventBroadcast: function wrapAfterEventBroadcast(event, callback) {
      return function() { self.broadcastAfterEvent(event, callback); };
    },

    broadcastBeforeEvent: function broadcastBeforeEvent(event, callback) {
      var preEvent = event.replicateAsPreEvent();
      self.broadcastEvent(preEvent, callback);
    },

    broadcastAfterEvent: function broadcastAfterEvent(event, callback) {
      var postEvent = event.replicateAsPostEvent();
      self.broadcastEvent(postEvent, callback);
    },

    broadcastEvent: function broadcastEvent(event, callback) {
      listeners.forEach(
        function(listener, callback) { listener.hear(event, callback); },
        callback
      );
    },

    lookupStepDefinitionByName: function lookupStepDefinitionByName(stepName) {
      return supportCodeLibrary.lookupStepDefinitionByName(stepName);
    },

    setWorld: function setWorld(newWorld) {
      world = newWorld;
    },

    getWorld: function getWorld() {
      return world;
    },

    isStepUndefined: function isStepUndefined(step) {
      var stepName = step.getName();
      return !supportCodeLibrary.isStepDefinitionNameDefined(stepName);
    },

    didAllFeaturesSucceed: function didAllFeaturesSucceed() {
      return allFeaturesSucceded;
    },

    witnessFailedStep: function witnessFailedStep() {
      allFeaturesSucceded = false;
      skippingSteps       = true;
    },

    witnessPendingStep: function witnessPendingStep() {
      skippingSteps = true;
    },

    witnessUndefinedStep: function witnessUndefinedStep() {
      skippingSteps = true;
    },

    witnessNewScenario: function witnessNewScenario() {
      skippingSteps = false;
    },

    isSkippingSteps: function isSkippingSteps() {
      return skippingSteps;
    },

    processStep: function processStep(step, callback) {
      if (self.isStepUndefined(step)) {
        self.witnessUndefinedStep();
        self.skipUndefinedStep(step, callback);
      } else if (self.isSkippingSteps()) {
        self.skipStep(step, callback);
      } else {
        self.executeStep(step, callback);
      }
    },

    executeStep: function executeStep(step, callback) {
      step.acceptVisitor(self, callback);
    },

    skipStep: function skipStep(step, callback) {
      var skippedStepResult = Cucumber.Runtime.SkippedStepResult({step: step});
      var payload           = { stepResult: skippedStepResult };
      var event             = AstTreeWalker.Event(AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    },

    skipUndefinedStep: function skipUndefinedStep(step, callback) {
      var undefinedStepResult = Cucumber.Runtime.UndefinedStepResult({step: step});
      var payload = { stepResult: undefinedStepResult };
      var event   = AstTreeWalker.Event(AstTreeWalker.STEP_RESULT_EVENT_NAME, payload);
      self.broadcastEvent(event, callback);
    }
  };
  return self;
};
AstTreeWalker.FEATURES_EVENT_NAME                 = 'Features';
AstTreeWalker.FEATURE_EVENT_NAME                  = 'Feature';
AstTreeWalker.BACKGROUND_EVENT_NAME               = 'Background';
AstTreeWalker.SCENARIO_EVENT_NAME                 = 'Scenario';
AstTreeWalker.STEP_EVENT_NAME                     = 'Step';
AstTreeWalker.STEP_RESULT_EVENT_NAME              = 'StepResult';
AstTreeWalker.BEFORE_EVENT_NAME_PREFIX            = 'Before';
AstTreeWalker.AFTER_EVENT_NAME_PREFIX             = 'After';
AstTreeWalker.NON_EVENT_LEADING_PARAMETERS_COUNT  = 0;
AstTreeWalker.NON_EVENT_TRAILING_PARAMETERS_COUNT = 2;
AstTreeWalker.Event                               = require('./ast_tree_walker/event');
module.exports                                    = AstTreeWalker;

});

require.define("/cucumber/runtime/ast_tree_walker/event.js", function (require, module, exports, __dirname, __filename) {
    var Event = function(name, payload) {
  var AstTreeWalker = require('../ast_tree_walker');

  var self = {
    getName: function getName() {
      return name;
    },

    getPayloadItem: function getPayloadItem(itemName) {
      return payload[itemName];
    },

    replicateAsPreEvent: function replicateAsPreEvent() {
      var newName = buildBeforeEventName(name);
      return AstTreeWalker.Event(newName, payload);
    },

    replicateAsPostEvent: function replicateAsPostEvent() {
      var newName = buildAfterEventName(name);
      return AstTreeWalker.Event(newName, payload);
    },

    occurredOn: function occurredOn(eventName) {
      return eventName == name;
    },

    occurredAfter: function occurredAfter(eventName) {
      var afterEventName = buildAfterEventName(eventName);
      return afterEventName == name;
    }
  };

  function buildBeforeEventName(eventName) {
    return AstTreeWalker.BEFORE_EVENT_NAME_PREFIX + eventName;
  }

  function buildAfterEventName(eventName) {
    return AstTreeWalker.AFTER_EVENT_NAME_PREFIX + eventName;
  }

  return self;
};
module.exports = Event;

});

require.define("/cucumber/runtime/step_result.js", function (require, module, exports, __dirname, __filename) {
    var StepResult = function (payload) {
  var self = {
    isFailed:     function isFailed()     { return false; },
    isPending:    function isPending()    { return false; },
    isSkipped:    function isSkipped()    { return false; },
    isSuccessful: function isSuccessful() { return false; },
    isUndefined:  function isUndefined()  { return false; },

    getStep: function getStep() {
      return payload.step;
    }
  };

  return self;
};

module.exports = StepResult;
});

require.define("/cucumber/runtime/successful_step_result.js", function (require, module, exports, __dirname, __filename) {
    var SuccessfulStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isSuccessful = function isSuccessful() { return true; };

  return self;
};
module.exports = SuccessfulStepResult;

});

require.define("/cucumber/runtime/pending_step_result.js", function (require, module, exports, __dirname, __filename) {
    var PendingStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isPending = function isPending() { return true; };

  return self;
};
module.exports = PendingStepResult;

});

require.define("/cucumber/runtime/failed_step_result.js", function (require, module, exports, __dirname, __filename) {
    var FailedStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isFailed = function isFailed() { return true; };

  self.getFailureException = function getFailureException() {
    return payload.failureException;
  };

  return self;
};
module.exports = FailedStepResult;

});

require.define("/cucumber/runtime/skipped_step_result.js", function (require, module, exports, __dirname, __filename) {
    var SkippedStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isSkipped = function isSkipped() { return true; };

  return self;
};
module.exports = SkippedStepResult;

});

require.define("/cucumber/runtime/undefined_step_result.js", function (require, module, exports, __dirname, __filename) {
    var UndefinedStepResult = function(payload) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Runtime.StepResult(payload);

  self.isUndefined = function isUndefined() { return true; };

  return self;
};
module.exports = UndefinedStepResult;

});

require.define("/cucumber/support_code.js", function (require, module, exports, __dirname, __filename) {
    var SupportCode                          = {};
SupportCode.Hook                         = require('./support_code/hook');
SupportCode.Library                      = require('./support_code/library');
SupportCode.StepDefinition               = require('./support_code/step_definition');
SupportCode.StepDefinitionSnippetBuilder = require('./support_code/step_definition_snippet_builder');
SupportCode.WorldConstructor             = require('./support_code/world_constructor');
module.exports                           = SupportCode;

});

require.define("/cucumber/support_code/hook.js", function (require, module, exports, __dirname, __filename) {
    var _ = require('underscore');

var Hook = function(code, options) {
  var Cucumber = require('../../cucumber');

  var tags = options['tags'] || [];

  var self = {
    invokeBesideScenario: function invokeBesideScenario(scenario, world, callback) {
      if (self.appliesToScenario(scenario))
        code.call(world, callback);
      else
        callback(function(endPostScenarioAroundHook) { endPostScenarioAroundHook(); });
    },

    appliesToScenario: function appliesToScenario(scenario) {
      var astFilter = self.getAstFilter();
      return astFilter.isScenarioEnrolled(scenario);
    },

    getAstFilter: function getAstFilter() {
      var tagGroups = Cucumber.TagGroupParser.getTagGroupsFromStrings(tags);
      var rules = _.map(tagGroups, function(tagGroup) {
        var rule = Cucumber.Ast.Filter.AnyOfTagsRule(tagGroup);
        return rule;
      });
      var astFilter = Cucumber.Ast.Filter(rules);
      return astFilter;
    }
  };
  return self;
};
module.exports = Hook;

});

require.define("/cucumber/support_code/library.js", function (require, module, exports, __dirname, __filename) {
    var Library = function(supportCodeDefinition) {
  var Cucumber = require('../../cucumber');

  var stepDefinitions  = Cucumber.Type.Collection();
  var hooker           = Cucumber.SupportCode.Library.Hooker();
  var worldConstructor = Cucumber.SupportCode.WorldConstructor();

  var self = {
    lookupStepDefinitionByName: function lookupStepDefinitionByName(name) {
      var matchingStepDefinition;

      stepDefinitions.syncForEach(function(stepDefinition) {
        if (stepDefinition.matchesStepName(name)) {
          matchingStepDefinition = stepDefinition;
        }
      });
      return matchingStepDefinition;
    },

    isStepDefinitionNameDefined: function isStepDefinitionNameDefined(name) {
      var stepDefinition = self.lookupStepDefinitionByName(name);
      return (stepDefinition != undefined);
    },

    hookUpFunction: function hookUpFunction(userFunction, scenario, world) {
      var hookedUpFunction = hooker.hookUpFunction(userFunction, scenario, world);
      return hookedUpFunction;
    },

    defineAroundHook: function defineAroundHook() {
      var tagGroupStrings = Cucumber.Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      hooker.addAroundHookCode(code, {tags: tagGroupStrings});
    },

    defineBeforeHook: function defineBeforeHook() {
      var tagGroupStrings = Cucumber.Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      hooker.addBeforeHookCode(code, {tags: tagGroupStrings});
    },

    defineAfterHook: function defineAfterHook() {
      var tagGroupStrings = Cucumber.Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      hooker.addAfterHookCode(code, {tags: tagGroupStrings});
    },

    defineStep: function defineStep(name, code) {
      var stepDefinition = Cucumber.SupportCode.StepDefinition(name, code);
      stepDefinitions.add(stepDefinition);
    },

    instantiateNewWorld: function instantiateNewWorld(callback) {
      var world = new worldConstructor(function(explicitWorld) {
        process.nextTick(function() { // release the constructor
          callback(explicitWorld || world);
        });
      });
    }
  };

  var supportCodeHelper = {
    Around     : self.defineAroundHook,
    Before     : self.defineBeforeHook,
    After      : self.defineAfterHook,
    Given      : self.defineStep,
    When       : self.defineStep,
    Then       : self.defineStep,
    defineStep : self.defineStep,
    World      : worldConstructor
  };
  supportCodeDefinition.call(supportCodeHelper);
  worldConstructor = supportCodeHelper.World;

  return self;
};
Library.Hooker = require('./library/hooker');
module.exports = Library;

});

require.define("/cucumber/support_code/library/hooker.js", function (require, module, exports, __dirname, __filename) {
    var Hooker = function() {
  var Cucumber = require('../../../cucumber');

  var aroundHooks = Cucumber.Type.Collection();
  var beforeHooks = Cucumber.Type.Collection();
  var afterHooks  = Cucumber.Type.Collection();

  var self = {
    addAroundHookCode: function addAroundHookCode(code, options) {
      var aroundHook = Cucumber.SupportCode.Hook(code, options);
      aroundHooks.add(aroundHook);
    },

    addBeforeHookCode: function addBeforeHookCode(code, options) {
      var beforeHook = Cucumber.SupportCode.Hook(code, options);
      beforeHooks.add(beforeHook);
    },

    addAfterHookCode: function addAfterHookCode(code, options) {
      var afterHook = Cucumber.SupportCode.Hook(code, options);
      afterHooks.unshift(afterHook);
    },

    hookUpFunction: function hookUpFunction(userFunction, scenario, world) {
      var hookedUpFunction = function(callback) {
        var postScenarioAroundHookCallbacks = Cucumber.Type.Collection();
        aroundHooks.forEach(callPreScenarioAroundHook, callBeforeHooks);

        function callPreScenarioAroundHook(aroundHook, preScenarioAroundHookCallback) {
          aroundHook.invokeBesideScenario(scenario, world, function(postScenarioAroundHookCallback) {
            postScenarioAroundHookCallbacks.unshift(postScenarioAroundHookCallback);
            preScenarioAroundHookCallback();
          });
        }

        function callBeforeHooks() {
          self.triggerBeforeHooks(scenario, world, callUserFunction);
        }

        function callUserFunction() {
          userFunction(callAfterHooks);
        }

        function callAfterHooks() {
          self.triggerAfterHooks(scenario, world, callPostScenarioAroundHooks);
        }

        function callPostScenarioAroundHooks() {
          postScenarioAroundHookCallbacks.forEach(
            callPostScenarioAroundHook,
            callback
          );
        }

        function callPostScenarioAroundHook(postScenarioAroundHookCallback, callback) {
          postScenarioAroundHookCallback.call(world, callback);
        }
      };
      return hookedUpFunction;
    },

    triggerBeforeHooks: function triggerBeforeHooks(scenario, world, callback) {
      beforeHooks.forEach(function(beforeHook, callback) {
        beforeHook.invokeBesideScenario(scenario, world, callback);
      }, callback);
    },

    triggerAfterHooks: function triggerAfterHooks(scenario, world, callback) {
      afterHooks.forEach(function(afterHook, callback) {
        afterHook.invokeBesideScenario(scenario, world, callback);
      }, callback);
    }
  };
  return self;
};
module.exports = Hooker;

});

require.define("/cucumber/support_code/step_definition.js", function (require, module, exports, __dirname, __filename) {
    var StepDefinition = function(pattern, code) {
  var Cucumber = require('../../cucumber');

  var self = {
    getPatternRegexp: function getPatternRegexp() {
      var regexp;
      if (pattern.replace) {
        var regexpString = pattern
          .replace(StepDefinition.QUOTED_DOLLAR_PARAMETER_REGEXP, StepDefinition.QUOTED_DOLLAR_PARAMETER_SUBSTITUTION)
          .replace(StepDefinition.DOLLAR_PARAMETER_REGEXP, StepDefinition.DOLLAR_PARAMETER_SUBSTITUTION);
        regexp = RegExp(regexpString);
      }
      else
        regexp = pattern;
      return regexp;
    },

    matchesStepName: function matchesStepName(stepName) {
      var regexp = self.getPatternRegexp();
      return regexp.test(stepName);
    },

    invoke: function invoke(step, world, callback) {
      var cleanUp = function cleanUp() {
        Cucumber.Util.Exception.unregisterUncaughtExceptionHandler(handleException);
      };

      var codeCallback = function() {
        var successfulStepResult = Cucumber.Runtime.SuccessfulStepResult({step: step});
        cleanUp();
        callback(successfulStepResult);
      };

      codeCallback.pending = function pending(reason) {
        var pendingStepResult = Cucumber.Runtime.PendingStepResult({step: step, pendingReason: reason});
        cleanUp();
        callback(pendingStepResult);
      };

      codeCallback.fail = function fail(failureReason) {
        var failureException = failureReason || new Error(StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE);
        var failedStepResult = Cucumber.Runtime.FailedStepResult({step: step, failureException: failureException});
        cleanUp();
        callback(failedStepResult);
      };

      var parameters      = self.buildInvocationParameters(step, codeCallback);
      var handleException = self.buildExceptionHandlerToCodeCallback(codeCallback);
      Cucumber.Util.Exception.registerUncaughtExceptionHandler(handleException);

      try {
        code.apply(world, parameters);
      } catch (exception) {
        handleException(exception);
      }
    },

    buildInvocationParameters: function buildInvocationParameters(step, callback) {
      var stepName      = step.getName();
      var patternRegexp = self.getPatternRegexp();
      var parameters    = patternRegexp.exec(stepName);
      parameters.shift();
      if (step.hasAttachment()) {
        var attachmentContents = step.getAttachmentContents();
        parameters.push(attachmentContents);
      }
      parameters.push(callback);
      return parameters;
    },

    buildExceptionHandlerToCodeCallback: function buildExceptionHandlerToCodeCallback(codeCallback) {
      var exceptionHandler = function handleScenarioException(exception) {
        if (exception)
          Cucumber.Debug.warn(exception.stack || exception, 'exception inside feature', 3);
        codeCallback.fail(exception);
      };
      return exceptionHandler;
    }
  };
  return self;
};

StepDefinition.DOLLAR_PARAMETER_REGEXP              = /\$[a-zA-Z_-]+/;
StepDefinition.DOLLAR_PARAMETER_SUBSTITUTION        = '(.*)';
StepDefinition.QUOTED_DOLLAR_PARAMETER_REGEXP       = /"\$[a-zA-Z_-]+"/;
StepDefinition.QUOTED_DOLLAR_PARAMETER_SUBSTITUTION = '"([^"]*)"';
StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE         = "Step failure";

module.exports = StepDefinition;

});

require.define("/cucumber/support_code/step_definition_snippet_builder.js", function (require, module, exports, __dirname, __filename) {
    var _  = require('underscore');

var StepDefinitionSnippetBuilder = function(step) {
  var Cucumber = require('../../cucumber');

  var self = {
    buildSnippet: function buildSnippet() {
      var functionName = self.buildStepDefinitionFunctionName();
      var pattern      = self.buildStepDefinitionPattern();
      var parameters   = self.buildStepDefinitionParameters();
      var snippet =
        StepDefinitionSnippetBuilder.STEP_DEFINITION_START  +
        functionName                                        +
        StepDefinitionSnippetBuilder.STEP_DEFINITION_INNER1 +
        pattern                                             +
        StepDefinitionSnippetBuilder.STEP_DEFINITION_INNER2 +
        parameters                                          +
        StepDefinitionSnippetBuilder.STEP_DEFINITION_END;
      return snippet;
    },

    buildStepDefinitionFunctionName: function buildStepDefinitionFunctionName() {
      var functionName;
      if (step.isOutcomeStep())
        functionName = StepDefinitionSnippetBuilder.OUTCOME_STEP_DEFINITION_FUNCTION_NAME;
      else if (step.isEventStep())
        functionName = StepDefinitionSnippetBuilder.EVENT_STEP_DEFINITION_FUNCTION_NAME;
      else
        functionName = StepDefinitionSnippetBuilder.CONTEXT_STEP_DEFINITION_FUNCTION_NAME;
      return functionName;
    },

    buildStepDefinitionPattern: function buildStepDefinitionPattern() {
      var stepName              = step.getName();
      var escapedStepName       = Cucumber.Util.RegExp.escapeString(stepName);
      var parameterizedStepName = self.parameterizeStepName(escapedStepName);
      var pattern               =
        StepDefinitionSnippetBuilder.PATTERN_START +
        parameterizedStepName                      +
        StepDefinitionSnippetBuilder.PATTERN_END
      return pattern;
    },

    buildStepDefinitionParameters: function buildStepDefinitionParameters() {
      var parameters = self.getStepDefinitionPatternMatchingGroupParameters();
      if (step.hasDocString())
        parameters = parameters.concat([StepDefinitionSnippetBuilder.STEP_DEFINITION_DOC_STRING]);
      else if (step.hasDataTable())
        parameters = parameters.concat([StepDefinitionSnippetBuilder.STEP_DEFINITION_DATA_TABLE]);
      var parametersAndCallback =
        parameters.concat([StepDefinitionSnippetBuilder.STEP_DEFINITION_CALLBACK]);
      var parameterString = parametersAndCallback.join(StepDefinitionSnippetBuilder.FUNCTION_PARAMETER_SEPARATOR);
      return parameterString;
    },

    getStepDefinitionPatternMatchingGroupParameters: function getStepDefinitionPatternMatchingGroupParameters() {
      var parameterCount = self.countStepDefinitionPatternMatchingGroups();
      var parameters = [];
      _(parameterCount).times(function(n) {
        var offset = n + 1;
        parameters.push('arg' + offset);
      });
      return parameters;
    },

    countStepDefinitionPatternMatchingGroups: function countStepDefinitionPatternMatchingGroups() {
      var stepDefinitionPattern    = self.buildStepDefinitionPattern();
      var numberMatchingGroupCount =
        Cucumber.Util.String.count(stepDefinitionPattern, StepDefinitionSnippetBuilder.NUMBER_MATCHING_GROUP);
      var quotedStringMatchingGroupCount =
        Cucumber.Util.String.count(stepDefinitionPattern, StepDefinitionSnippetBuilder.QUOTED_STRING_MATCHING_GROUP);
      var count = numberMatchingGroupCount + quotedStringMatchingGroupCount;
      return count;
    },

    parameterizeStepName: function parameterizeStepName(stepName) {
      var parameterizedStepName =
        stepName
        .replace(StepDefinitionSnippetBuilder.NUMBER_PATTERN, StepDefinitionSnippetBuilder.NUMBER_MATCHING_GROUP)
        .replace(StepDefinitionSnippetBuilder.QUOTED_STRING_PATTERN, StepDefinitionSnippetBuilder.QUOTED_STRING_MATCHING_GROUP);
      return parameterizedStepName;
    }
  };
  return self;
};

StepDefinitionSnippetBuilder.STEP_DEFINITION_START                 = 'this.';
StepDefinitionSnippetBuilder.STEP_DEFINITION_INNER1                = '(';
StepDefinitionSnippetBuilder.STEP_DEFINITION_INNER2                = ', function(';
StepDefinitionSnippetBuilder.STEP_DEFINITION_END                   = ") {\n  // express the regexp above with the code you wish you had\n  callback.pending();\n});\n";
StepDefinitionSnippetBuilder.STEP_DEFINITION_DOC_STRING            = 'string';
StepDefinitionSnippetBuilder.STEP_DEFINITION_DATA_TABLE            = 'table';
StepDefinitionSnippetBuilder.STEP_DEFINITION_CALLBACK              = 'callback';
StepDefinitionSnippetBuilder.PATTERN_START                         = '/^';
StepDefinitionSnippetBuilder.PATTERN_END                           = '$/';
StepDefinitionSnippetBuilder.CONTEXT_STEP_DEFINITION_FUNCTION_NAME = 'Given';
StepDefinitionSnippetBuilder.EVENT_STEP_DEFINITION_FUNCTION_NAME   = 'When';
StepDefinitionSnippetBuilder.OUTCOME_STEP_DEFINITION_FUNCTION_NAME = 'Then';
StepDefinitionSnippetBuilder.NUMBER_PATTERN                        = /\d+/gi;
StepDefinitionSnippetBuilder.NUMBER_MATCHING_GROUP                 = '(\\d+)';
StepDefinitionSnippetBuilder.QUOTED_STRING_PATTERN                 = /"[^"]*"/gi;
StepDefinitionSnippetBuilder.QUOTED_STRING_MATCHING_GROUP          = '"([^"]*)"';
StepDefinitionSnippetBuilder.FUNCTION_PARAMETER_SEPARATOR          = ', ';
module.exports = StepDefinitionSnippetBuilder;

});

require.define("/cucumber/support_code/world_constructor.js", function (require, module, exports, __dirname, __filename) {
    var WorldConstructor = function() {
  return function World(callback) { callback() };
};
module.exports = WorldConstructor;

});

require.define("/cucumber/tag_group_parser.js", function (require, module, exports, __dirname, __filename) {
    var _ = require('underscore');

var TagGroupParser = function(tagGroupString) {
  var self = {
    parse: function parse() {
      var splitTags = tagGroupString.split(TagGroupParser.TAG_SEPARATOR);
      var trimmedTags = _.map(splitTags, function(tag) { return tag.trim(); });
      return trimmedTags;
    }
  };
  return self;
};

TagGroupParser.getTagGroupsFromStrings = function getTagGroupsFromStrings(tagGroupStrings) {
  var Cucumber = require('../cucumber');

  var tagGroups = _.map(tagGroupStrings, function(tagOptionValue) {
    var tagGroupParser = Cucumber.TagGroupParser(tagOptionValue);
    var tagGroup       = tagGroupParser.parse();
    return tagGroup;
  });
  return tagGroups;
};

TagGroupParser.TAG_SEPARATOR = ',';
module.exports = TagGroupParser;

});

require.define("/cucumber/type.js", function (require, module, exports, __dirname, __filename) {
    var Type           = {};
Type.Collection    = require('./type/collection');
Type.HashDataTable = require('./type/hash_data_table');
Type.String        = require('./type/string');
module.exports     = Type;

});

require.define("/cucumber/type/collection.js", function (require, module, exports, __dirname, __filename) {
    var Collection = function() {
  var items = new Array();
  var self = {
    add:         function add(item)                       { items.push(item); },
    unshift:     function unshift(item)                   { items.unshift(item); },
    getLast:     function getLast()                       { return items[items.length-1]; },
    syncForEach: function syncForEach(userFunction)       { items.forEach(userFunction); },
    forEach:     function forEach(userFunction, callback) {
      var itemsCopy = items.slice(0);
      function iterate() {
        if (itemsCopy.length > 0) {
          processItem();
        } else {
          callback();
        };
      }
      function processItem() {
        var item = itemsCopy.shift();
        userFunction(item, function() {
          iterate();
        });
      };
      iterate();
    },
    length: function length() { return items.length; }
  };
  return self;
};
module.exports = Collection;

});

require.define("/cucumber/type/hash_data_table.js", function (require, module, exports, __dirname, __filename) {
    var HashDataTable = function(rawArray) {
  var self = {
    raw: function raw() {
      var hashKeys        = self.getHashKeys();
      var hashValueArrays = self.getHashValueArrays();
      var hashes          = self.createHashesFromKeysAndValueArrays(hashKeys, hashValueArrays);
      return hashes;
    },

    getHashKeys: function getHashKeys() {
      return rawArray[0];
    },

    getHashValueArrays: function getHashValueArrays() {
      var _rawArray = [].concat(rawArray);
      _rawArray.shift();
      return _rawArray;
    },

    createHashesFromKeysAndValueArrays: function createHashesFromKeysAndValueArrays(keys, valueArrays) {
      var hashes = [];
      valueArrays.forEach(function(values) {
        var hash = self.createHashFromKeysAndValues(keys, values);
        hashes.push(hash);
      });
      return hashes;
    },

    createHashFromKeysAndValues: function createHashFromKeysAndValues(keys, values) {
      var hash = {};
      var len  = keys.length;
      for (var i = 0; i < len; i++) {
        hash[keys[i]] = values[i];
      }
      return hash;
    }
  };
  return self;
};

module.exports = HashDataTable;
});

require.define("/cucumber/type/string.js", function (require, module, exports, __dirname, __filename) {
    if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}
module.exports = String;

});

require.define("/cucumber/util.js", function (require, module, exports, __dirname, __filename) {
    var Util       = {};
Util.Arguments = require('./util/arguments');
Util.Exception = require('./util/exception');
Util.RegExp    = require('./util/reg_exp');
Util.String    = require('./util/string');
module.exports = Util;

});

require.define("/cucumber/util/arguments.js", function (require, module, exports, __dirname, __filename) {
    var Arguments = function Arguments(argumentsObject) {
  return Array.prototype.slice.call(argumentsObject);
};
module.exports = Arguments;
});

require.define("/cucumber/util/exception.js", function (require, module, exports, __dirname, __filename) {
    var Exception = {
  registerUncaughtExceptionHandler: function registerUncaughtExceptionHandler(exceptionHandler) {
    if (process.on)
      process.on('uncaughtException', exceptionHandler);
    else
      window.onerror = exceptionHandler;
  },

  unregisterUncaughtExceptionHandler: function unregisterUncaughtExceptionHandler(exceptionHandler) {
    if (process.removeListener)
      process.removeListener('uncaughtException', exceptionHandler);
    else
     window.onerror = void(0);
  }
};

module.exports = Exception;

});

require.define("/cucumber/util/reg_exp.js", function (require, module, exports, __dirname, __filename) {
    var RegExp = {
  escapeString: function escapeString(string) {
    var escaped = string.replace(RegExp.ESCAPE_PATTERN, RegExp.ESCAPE_REPLACEMENT);
    return escaped;
  }
};

RegExp.ESCAPE_PATTERN     = /[-[\]{}()*+?.\\^$|#\n\/]/g;
RegExp.ESCAPE_REPLACEMENT = "\\$&";
module.exports = RegExp;

});

require.define("/cucumber/util/string.js", function (require, module, exports, __dirname, __filename) {
    var String = {
  count: function count(hayStack, needle) {
    var splitHayStack = hayStack.split(needle);
    return splitHayStack.length - 1;
  }
};
module.exports = String;

});

require.define("/cucumber/volatile_configuration.js", function (require, module, exports, __dirname, __filename) {
    var VolatileConfiguration = function VolatileConfiguration(featureSource, supportCodeInitializer, options) {
  var Cucumber = require('../cucumber');

  var supportCodeLibrary = Cucumber.SupportCode.Library(supportCodeInitializer);

  options = options || {};
  var tagGroupStrings = options['tags'] || [];

  var self = {
    getFeatureSources: function getFeatureSources() {
      var featureNameSourcePair = [VolatileConfiguration.FEATURE_SOURCE_NAME, featureSource];
      return [featureNameSourcePair];
    },

    getAstFilter: function getAstFilter() {
      var tagRules = self.getTagAstFilterRules();
      var astFilter = Cucumber.Ast.Filter(tagRules);
      return astFilter;
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      return supportCodeLibrary;
    },

    getTagAstFilterRules: function getTagAstFilterRules() {
      var rules = [];
      tagGroupStrings.forEach(function(tagGroupString) {
        var rule = self.buildAstFilterRuleFromTagGroupString(tagGroupString);
        rules.push(rule);
      });
      return rules;
    },

    buildAstFilterRuleFromTagGroupString: function buildAstFilterRuleFromTagGroupString(tagGroupString) {
      var tagGroupParser = Cucumber.TagGroupParser(tagGroupString);
      var tagGroup       = tagGroupParser.parse();
      var rule           = Cucumber.Ast.Filter.AnyOfTagsRule(tagGroup);
      return rule;
    }
  };
  return self;
};
VolatileConfiguration.FEATURE_SOURCE_NAME = "(feature)";
module.exports = VolatileConfiguration;

});

require.define("/node_modules/gherkin/lib/gherkin/lexer/en.js", function (require, module, exports, __dirname, __filename) {
    
/* line 1 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */
;(function() {


/* line 126 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */



/* line 11 "js/lib/gherkin/lexer/en.js" */
const _lexer_actions = [
	0, 1, 0, 1, 1, 1, 2, 1, 
	3, 1, 4, 1, 5, 1, 6, 1, 
	7, 1, 8, 1, 9, 1, 10, 1, 
	11, 1, 12, 1, 13, 1, 16, 1, 
	17, 1, 18, 1, 19, 1, 20, 1, 
	21, 1, 22, 1, 23, 2, 2, 18, 
	2, 3, 4, 2, 13, 0, 2, 14, 
	15, 2, 17, 0, 2, 17, 1, 2, 
	17, 16, 2, 17, 19, 2, 18, 6, 
	2, 18, 7, 2, 18, 8, 2, 18, 
	9, 2, 18, 10, 2, 18, 16, 2, 
	20, 21, 2, 22, 0, 2, 22, 1, 
	2, 22, 16, 2, 22, 19, 3, 4, 
	14, 15, 3, 5, 14, 15, 3, 11, 
	14, 15, 3, 12, 14, 15, 3, 13, 
	14, 15, 3, 14, 15, 18, 3, 17, 
	0, 11, 3, 17, 14, 15, 4, 2, 
	14, 15, 18, 4, 3, 4, 14, 15, 
	4, 17, 0, 14, 15, 5, 17, 0, 
	11, 14, 15
];

const _lexer_key_offsets = [
	0, 0, 19, 37, 38, 39, 41, 43, 
	48, 53, 58, 63, 67, 71, 73, 74, 
	75, 76, 77, 78, 79, 80, 81, 82, 
	83, 84, 85, 86, 87, 88, 89, 91, 
	93, 98, 105, 110, 111, 112, 114, 115, 
	116, 117, 118, 119, 120, 121, 122, 123, 
	124, 125, 140, 142, 144, 146, 148, 150, 
	152, 154, 156, 158, 160, 162, 164, 166, 
	168, 170, 188, 189, 190, 191, 192, 193, 
	194, 195, 196, 197, 198, 205, 207, 209, 
	211, 213, 215, 217, 219, 220, 221, 222, 
	223, 224, 225, 226, 227, 228, 239, 241, 
	243, 245, 247, 249, 251, 253, 255, 257, 
	259, 261, 263, 265, 267, 269, 271, 273, 
	275, 277, 279, 281, 283, 285, 287, 289, 
	291, 293, 295, 297, 299, 301, 303, 305, 
	307, 309, 311, 313, 315, 317, 319, 321, 
	323, 325, 327, 331, 334, 336, 338, 340, 
	342, 344, 346, 348, 350, 352, 354, 356, 
	357, 358, 359, 360, 361, 362, 363, 364, 
	365, 366, 367, 370, 372, 373, 374, 375, 
	376, 377, 378, 379, 380, 381, 396, 398, 
	400, 402, 404, 406, 408, 410, 412, 414, 
	416, 418, 420, 422, 424, 426, 428, 430, 
	432, 434, 436, 438, 440, 442, 444, 446, 
	448, 450, 452, 454, 456, 458, 460, 462, 
	464, 466, 468, 470, 472, 473, 474, 475, 
	476, 477, 478, 479, 480, 495, 497, 499, 
	501, 503, 505, 507, 509, 511, 513, 515, 
	517, 519, 521, 523, 525, 527, 529, 532, 
	534, 536, 538, 540, 542, 544, 546, 548, 
	550, 552, 554, 556, 558, 560, 562, 564, 
	566, 568, 570, 572, 574, 576, 578, 580, 
	582, 584, 586, 589, 592, 594, 596, 598, 
	600, 602, 604, 606, 608, 610, 612, 614, 
	616, 617, 621, 627, 630, 632, 638, 656, 
	658, 660, 662, 664, 666, 668, 670, 672, 
	674, 676, 678, 680, 682, 684, 686, 688, 
	690, 692, 694, 696, 698, 700, 703, 706, 
	708, 710, 712, 714, 716, 718, 720, 722, 
	724, 726, 728, 730, 731, 732, 733
];

const _lexer_trans_keys = [
	10, 32, 34, 35, 37, 42, 64, 65, 
	66, 69, 70, 71, 83, 84, 87, 124, 
	239, 9, 13, 10, 32, 34, 35, 37, 
	42, 64, 65, 66, 69, 70, 71, 83, 
	84, 87, 124, 9, 13, 34, 34, 10, 
	13, 10, 13, 10, 32, 34, 9, 13, 
	10, 32, 34, 9, 13, 10, 32, 34, 
	9, 13, 10, 32, 34, 9, 13, 10, 
	32, 9, 13, 10, 32, 9, 13, 10, 
	13, 10, 95, 70, 69, 65, 84, 85, 
	82, 69, 95, 69, 78, 68, 95, 37, 
	32, 10, 13, 10, 13, 13, 32, 64, 
	9, 10, 9, 10, 13, 32, 64, 11, 
	12, 10, 32, 64, 9, 13, 110, 100, 
	97, 117, 99, 107, 103, 114, 111, 117, 
	110, 100, 58, 10, 10, 10, 32, 35, 
	37, 42, 64, 65, 66, 70, 71, 83, 
	84, 87, 9, 13, 10, 95, 10, 70, 
	10, 69, 10, 65, 10, 84, 10, 85, 
	10, 82, 10, 69, 10, 95, 10, 69, 
	10, 78, 10, 68, 10, 95, 10, 37, 
	10, 32, 10, 32, 34, 35, 37, 42, 
	64, 65, 66, 69, 70, 71, 83, 84, 
	87, 124, 9, 13, 120, 97, 109, 112, 
	108, 101, 115, 58, 10, 10, 10, 32, 
	35, 70, 124, 9, 13, 10, 101, 10, 
	97, 10, 116, 10, 117, 10, 114, 10, 
	101, 10, 58, 101, 97, 116, 117, 114, 
	101, 58, 10, 10, 10, 32, 35, 37, 
	64, 66, 69, 70, 83, 9, 13, 10, 
	95, 10, 70, 10, 69, 10, 65, 10, 
	84, 10, 85, 10, 82, 10, 69, 10, 
	95, 10, 69, 10, 78, 10, 68, 10, 
	95, 10, 37, 10, 97, 10, 99, 10, 
	107, 10, 103, 10, 114, 10, 111, 10, 
	117, 10, 110, 10, 100, 10, 58, 10, 
	120, 10, 97, 10, 109, 10, 112, 10, 
	108, 10, 101, 10, 115, 10, 101, 10, 
	97, 10, 116, 10, 117, 10, 114, 10, 
	101, 10, 99, 10, 101, 10, 110, 10, 
	97, 10, 114, 10, 105, 10, 111, 10, 
	32, 58, 115, 10, 79, 84, 10, 117, 
	10, 116, 10, 108, 10, 105, 10, 110, 
	10, 101, 10, 109, 10, 112, 10, 108, 
	10, 97, 10, 116, 105, 118, 101, 110, 
	99, 101, 110, 97, 114, 105, 111, 32, 
	58, 115, 79, 84, 117, 116, 108, 105, 
	110, 101, 58, 10, 10, 10, 32, 35, 
	37, 42, 64, 65, 66, 70, 71, 83, 
	84, 87, 9, 13, 10, 95, 10, 70, 
	10, 69, 10, 65, 10, 84, 10, 85, 
	10, 82, 10, 69, 10, 95, 10, 69, 
	10, 78, 10, 68, 10, 95, 10, 37, 
	10, 32, 10, 110, 10, 100, 10, 117, 
	10, 116, 10, 101, 10, 97, 10, 116, 
	10, 117, 10, 114, 10, 101, 10, 58, 
	10, 105, 10, 118, 10, 101, 10, 110, 
	10, 99, 10, 101, 10, 110, 10, 97, 
	10, 114, 10, 105, 10, 111, 10, 104, 
	101, 109, 112, 108, 97, 116, 10, 10, 
	10, 32, 35, 37, 42, 64, 65, 66, 
	70, 71, 83, 84, 87, 9, 13, 10, 
	95, 10, 70, 10, 69, 10, 65, 10, 
	84, 10, 85, 10, 82, 10, 69, 10, 
	95, 10, 69, 10, 78, 10, 68, 10, 
	95, 10, 37, 10, 32, 10, 110, 10, 
	100, 10, 97, 117, 10, 99, 10, 107, 
	10, 103, 10, 114, 10, 111, 10, 117, 
	10, 110, 10, 100, 10, 58, 10, 116, 
	10, 101, 10, 97, 10, 116, 10, 117, 
	10, 114, 10, 101, 10, 105, 10, 118, 
	10, 101, 10, 110, 10, 99, 10, 101, 
	10, 110, 10, 97, 10, 114, 10, 105, 
	10, 111, 10, 32, 58, 10, 79, 84, 
	10, 117, 10, 116, 10, 108, 10, 105, 
	10, 110, 10, 101, 10, 109, 10, 112, 
	10, 108, 10, 97, 10, 116, 10, 104, 
	104, 32, 124, 9, 13, 10, 32, 92, 
	124, 9, 13, 10, 92, 124, 10, 92, 
	10, 32, 92, 124, 9, 13, 10, 32, 
	34, 35, 37, 42, 64, 65, 66, 69, 
	70, 71, 83, 84, 87, 124, 9, 13, 
	10, 110, 10, 100, 10, 117, 10, 116, 
	10, 101, 10, 97, 10, 116, 10, 117, 
	10, 114, 10, 101, 10, 58, 10, 105, 
	10, 118, 10, 101, 10, 110, 10, 99, 
	10, 101, 10, 110, 10, 97, 10, 114, 
	10, 105, 10, 111, 10, 32, 58, 10, 
	79, 84, 10, 117, 10, 116, 10, 108, 
	10, 105, 10, 110, 10, 101, 10, 109, 
	10, 112, 10, 108, 10, 97, 10, 116, 
	10, 104, 116, 187, 191, 0
];

const _lexer_single_lengths = [
	0, 17, 16, 1, 1, 2, 2, 3, 
	3, 3, 3, 2, 2, 2, 1, 1, 
	1, 1, 1, 1, 1, 1, 1, 1, 
	1, 1, 1, 1, 1, 1, 2, 2, 
	3, 5, 3, 1, 1, 2, 1, 1, 
	1, 1, 1, 1, 1, 1, 1, 1, 
	1, 13, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 16, 1, 1, 1, 1, 1, 1, 
	1, 1, 1, 1, 5, 2, 2, 2, 
	2, 2, 2, 2, 1, 1, 1, 1, 
	1, 1, 1, 1, 1, 9, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 4, 3, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 1, 
	1, 1, 1, 1, 1, 1, 1, 1, 
	1, 1, 3, 2, 1, 1, 1, 1, 
	1, 1, 1, 1, 1, 13, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 1, 1, 1, 1, 
	1, 1, 1, 1, 13, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 3, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 3, 3, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	1, 2, 4, 3, 2, 4, 16, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 2, 2, 3, 3, 2, 
	2, 2, 2, 2, 2, 2, 2, 2, 
	2, 2, 2, 1, 1, 1, 0
];

const _lexer_range_lengths = [
	0, 1, 1, 0, 0, 0, 0, 1, 
	1, 1, 1, 1, 1, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	1, 1, 1, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 1, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 1, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 1, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 1, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 1, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 1, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 1, 1, 0, 0, 1, 1, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0
];

const _lexer_index_offsets = [
	0, 0, 19, 37, 39, 41, 44, 47, 
	52, 57, 62, 67, 71, 75, 78, 80, 
	82, 84, 86, 88, 90, 92, 94, 96, 
	98, 100, 102, 104, 106, 108, 110, 113, 
	116, 121, 128, 133, 135, 137, 140, 142, 
	144, 146, 148, 150, 152, 154, 156, 158, 
	160, 162, 177, 180, 183, 186, 189, 192, 
	195, 198, 201, 204, 207, 210, 213, 216, 
	219, 222, 240, 242, 244, 246, 248, 250, 
	252, 254, 256, 258, 260, 267, 270, 273, 
	276, 279, 282, 285, 288, 290, 292, 294, 
	296, 298, 300, 302, 304, 306, 317, 320, 
	323, 326, 329, 332, 335, 338, 341, 344, 
	347, 350, 353, 356, 359, 362, 365, 368, 
	371, 374, 377, 380, 383, 386, 389, 392, 
	395, 398, 401, 404, 407, 410, 413, 416, 
	419, 422, 425, 428, 431, 434, 437, 440, 
	443, 446, 449, 454, 458, 461, 464, 467, 
	470, 473, 476, 479, 482, 485, 488, 491, 
	493, 495, 497, 499, 501, 503, 505, 507, 
	509, 511, 513, 517, 520, 522, 524, 526, 
	528, 530, 532, 534, 536, 538, 553, 556, 
	559, 562, 565, 568, 571, 574, 577, 580, 
	583, 586, 589, 592, 595, 598, 601, 604, 
	607, 610, 613, 616, 619, 622, 625, 628, 
	631, 634, 637, 640, 643, 646, 649, 652, 
	655, 658, 661, 664, 667, 669, 671, 673, 
	675, 677, 679, 681, 683, 698, 701, 704, 
	707, 710, 713, 716, 719, 722, 725, 728, 
	731, 734, 737, 740, 743, 746, 749, 753, 
	756, 759, 762, 765, 768, 771, 774, 777, 
	780, 783, 786, 789, 792, 795, 798, 801, 
	804, 807, 810, 813, 816, 819, 822, 825, 
	828, 831, 834, 838, 842, 845, 848, 851, 
	854, 857, 860, 863, 866, 869, 872, 875, 
	878, 880, 884, 890, 894, 897, 903, 921, 
	924, 927, 930, 933, 936, 939, 942, 945, 
	948, 951, 954, 957, 960, 963, 966, 969, 
	972, 975, 978, 981, 984, 987, 991, 995, 
	998, 1001, 1004, 1007, 1010, 1013, 1016, 1019, 
	1022, 1025, 1028, 1031, 1033, 1035, 1037
];

const _lexer_indicies = [
	2, 1, 3, 4, 5, 6, 7, 8, 
	9, 10, 11, 12, 13, 14, 14, 15, 
	16, 1, 0, 2, 1, 3, 4, 5, 
	6, 7, 8, 9, 10, 11, 12, 13, 
	14, 14, 15, 1, 0, 17, 0, 18, 
	0, 20, 21, 19, 23, 24, 22, 27, 
	26, 28, 26, 25, 31, 30, 32, 30, 
	29, 31, 30, 33, 30, 29, 31, 30, 
	34, 30, 29, 36, 35, 35, 0, 2, 
	37, 37, 0, 39, 40, 38, 2, 0, 
	41, 0, 42, 0, 43, 0, 44, 0, 
	45, 0, 46, 0, 47, 0, 48, 0, 
	49, 0, 50, 0, 51, 0, 52, 0, 
	53, 0, 54, 0, 55, 0, 57, 58, 
	56, 60, 61, 59, 0, 0, 0, 0, 
	62, 63, 64, 63, 63, 66, 65, 62, 
	2, 67, 7, 67, 0, 68, 0, 69, 
	0, 70, 71, 0, 72, 0, 73, 0, 
	74, 0, 75, 0, 76, 0, 77, 0, 
	78, 0, 79, 0, 80, 0, 82, 81, 
	84, 83, 84, 85, 86, 87, 88, 86, 
	89, 90, 91, 92, 93, 94, 94, 85, 
	83, 84, 95, 83, 84, 96, 83, 84, 
	97, 83, 84, 98, 83, 84, 99, 83, 
	84, 100, 83, 84, 101, 83, 84, 102, 
	83, 84, 103, 83, 84, 104, 83, 84, 
	105, 83, 84, 106, 83, 84, 107, 83, 
	84, 108, 83, 84, 109, 83, 111, 110, 
	112, 113, 114, 115, 116, 117, 118, 119, 
	120, 121, 122, 123, 123, 124, 110, 0, 
	125, 0, 126, 0, 127, 0, 128, 0, 
	129, 0, 130, 0, 131, 0, 132, 0, 
	134, 133, 136, 135, 136, 137, 138, 139, 
	138, 137, 135, 136, 140, 135, 136, 141, 
	135, 136, 142, 135, 136, 143, 135, 136, 
	144, 135, 136, 145, 135, 136, 146, 135, 
	147, 0, 148, 0, 149, 0, 150, 0, 
	151, 0, 152, 0, 153, 0, 155, 154, 
	157, 156, 157, 158, 159, 160, 159, 161, 
	162, 163, 164, 158, 156, 157, 165, 156, 
	157, 166, 156, 157, 167, 156, 157, 168, 
	156, 157, 169, 156, 157, 170, 156, 157, 
	171, 156, 157, 172, 156, 157, 173, 156, 
	157, 174, 156, 157, 175, 156, 157, 176, 
	156, 157, 177, 156, 157, 178, 156, 157, 
	179, 156, 157, 180, 156, 157, 181, 156, 
	157, 182, 156, 157, 183, 156, 157, 184, 
	156, 157, 185, 156, 157, 186, 156, 157, 
	187, 156, 157, 188, 156, 157, 189, 156, 
	157, 190, 156, 157, 191, 156, 157, 192, 
	156, 157, 193, 156, 157, 194, 156, 157, 
	187, 156, 157, 195, 156, 157, 196, 156, 
	157, 197, 156, 157, 198, 156, 157, 199, 
	156, 157, 187, 156, 157, 200, 156, 157, 
	201, 156, 157, 202, 156, 157, 203, 156, 
	157, 204, 156, 157, 205, 156, 157, 206, 
	156, 157, 207, 188, 187, 156, 157, 208, 
	209, 156, 157, 210, 156, 157, 211, 156, 
	157, 212, 156, 157, 213, 156, 157, 199, 
	156, 157, 214, 156, 157, 215, 156, 157, 
	216, 156, 157, 217, 156, 157, 218, 156, 
	157, 199, 156, 219, 0, 220, 0, 221, 
	0, 69, 0, 222, 0, 223, 0, 224, 
	0, 225, 0, 226, 0, 227, 0, 228, 
	0, 229, 230, 131, 0, 231, 232, 0, 
	233, 0, 234, 0, 235, 0, 236, 0, 
	237, 0, 238, 0, 239, 0, 241, 240, 
	243, 242, 243, 244, 245, 246, 247, 245, 
	248, 249, 250, 251, 252, 253, 253, 244, 
	242, 243, 254, 242, 243, 255, 242, 243, 
	256, 242, 243, 257, 242, 243, 258, 242, 
	243, 259, 242, 243, 260, 242, 243, 261, 
	242, 243, 262, 242, 243, 263, 242, 243, 
	264, 242, 243, 265, 242, 243, 266, 242, 
	243, 267, 242, 243, 268, 242, 243, 269, 
	242, 243, 270, 242, 243, 271, 242, 243, 
	270, 242, 243, 272, 242, 243, 273, 242, 
	243, 274, 242, 243, 275, 242, 243, 276, 
	242, 243, 277, 242, 243, 268, 242, 243, 
	278, 242, 243, 279, 242, 243, 280, 242, 
	243, 270, 242, 243, 281, 242, 243, 282, 
	242, 243, 283, 242, 243, 284, 242, 243, 
	285, 242, 243, 286, 242, 243, 277, 242, 
	243, 279, 242, 287, 0, 288, 0, 289, 
	0, 290, 0, 291, 0, 237, 0, 293, 
	292, 295, 294, 295, 296, 297, 298, 299, 
	297, 300, 301, 302, 303, 304, 305, 305, 
	296, 294, 295, 306, 294, 295, 307, 294, 
	295, 308, 294, 295, 309, 294, 295, 310, 
	294, 295, 311, 294, 295, 312, 294, 295, 
	313, 294, 295, 314, 294, 295, 315, 294, 
	295, 316, 294, 295, 317, 294, 295, 318, 
	294, 295, 319, 294, 295, 320, 294, 295, 
	321, 294, 295, 322, 294, 295, 323, 324, 
	294, 295, 325, 294, 295, 326, 294, 295, 
	327, 294, 295, 328, 294, 295, 329, 294, 
	295, 330, 294, 295, 331, 294, 295, 332, 
	294, 295, 320, 294, 295, 322, 294, 295, 
	333, 294, 295, 334, 294, 295, 335, 294, 
	295, 336, 294, 295, 337, 294, 295, 332, 
	294, 295, 338, 294, 295, 339, 294, 295, 
	340, 294, 295, 322, 294, 295, 341, 294, 
	295, 342, 294, 295, 343, 294, 295, 344, 
	294, 295, 345, 294, 295, 346, 294, 295, 
	347, 294, 295, 348, 320, 294, 295, 349, 
	350, 294, 295, 351, 294, 295, 352, 294, 
	295, 353, 294, 295, 354, 294, 295, 337, 
	294, 295, 355, 294, 295, 356, 294, 295, 
	357, 294, 295, 358, 294, 295, 359, 294, 
	295, 337, 294, 295, 339, 294, 220, 0, 
	360, 361, 360, 0, 364, 363, 365, 366, 
	363, 362, 0, 368, 369, 367, 0, 368, 
	367, 364, 370, 368, 369, 370, 367, 364, 
	371, 372, 373, 374, 375, 376, 377, 378, 
	379, 380, 381, 382, 383, 383, 384, 371, 
	0, 84, 385, 83, 84, 386, 83, 84, 
	387, 83, 84, 386, 83, 84, 388, 83, 
	84, 389, 83, 84, 390, 83, 84, 391, 
	83, 84, 392, 83, 84, 393, 83, 84, 
	109, 83, 84, 394, 83, 84, 395, 83, 
	84, 396, 83, 84, 386, 83, 84, 397, 
	83, 84, 398, 83, 84, 399, 83, 84, 
	400, 83, 84, 401, 83, 84, 402, 83, 
	84, 403, 83, 84, 404, 109, 83, 84, 
	405, 406, 83, 84, 407, 83, 84, 408, 
	83, 84, 409, 83, 84, 410, 83, 84, 
	392, 83, 84, 411, 83, 84, 412, 83, 
	84, 413, 83, 84, 414, 83, 84, 415, 
	83, 84, 392, 83, 84, 395, 83, 69, 
	0, 416, 0, 1, 0, 417, 0
];

const _lexer_trans_targs = [
	0, 2, 2, 3, 13, 15, 29, 32, 
	35, 37, 66, 84, 151, 155, 280, 281, 
	324, 4, 5, 6, 7, 6, 6, 7, 
	6, 8, 8, 8, 9, 8, 8, 8, 
	9, 10, 11, 12, 2, 12, 13, 2, 
	14, 16, 17, 18, 19, 20, 21, 22, 
	23, 24, 25, 26, 27, 28, 326, 30, 
	31, 2, 14, 31, 2, 14, 33, 34, 
	2, 33, 32, 34, 36, 29, 38, 323, 
	39, 40, 41, 42, 43, 44, 45, 46, 
	47, 48, 49, 48, 49, 49, 2, 50, 
	64, 287, 289, 291, 298, 302, 322, 51, 
	52, 53, 54, 55, 56, 57, 58, 59, 
	60, 61, 62, 63, 2, 65, 2, 2, 
	3, 13, 15, 29, 32, 35, 37, 66, 
	84, 151, 155, 280, 281, 67, 68, 69, 
	70, 71, 72, 73, 74, 75, 76, 75, 
	76, 76, 2, 77, 78, 79, 80, 81, 
	82, 83, 65, 85, 86, 87, 88, 89, 
	90, 91, 92, 93, 92, 93, 93, 2, 
	94, 108, 118, 125, 131, 95, 96, 97, 
	98, 99, 100, 101, 102, 103, 104, 105, 
	106, 107, 2, 109, 110, 111, 112, 113, 
	114, 115, 116, 117, 65, 119, 120, 121, 
	122, 123, 124, 126, 127, 128, 129, 130, 
	132, 133, 134, 135, 136, 137, 138, 139, 
	140, 145, 141, 142, 143, 144, 146, 147, 
	148, 149, 150, 152, 153, 154, 156, 157, 
	158, 159, 160, 161, 162, 163, 218, 164, 
	212, 165, 166, 167, 168, 169, 170, 171, 
	172, 173, 172, 173, 173, 2, 174, 188, 
	189, 191, 193, 200, 204, 211, 175, 176, 
	177, 178, 179, 180, 181, 182, 183, 184, 
	185, 186, 187, 2, 65, 190, 188, 192, 
	194, 195, 196, 197, 198, 199, 201, 202, 
	203, 205, 206, 207, 208, 209, 210, 213, 
	214, 215, 216, 217, 219, 220, 219, 220, 
	220, 2, 221, 235, 236, 238, 249, 255, 
	259, 279, 222, 223, 224, 225, 226, 227, 
	228, 229, 230, 231, 232, 233, 234, 2, 
	65, 237, 235, 239, 248, 240, 241, 242, 
	243, 244, 245, 246, 247, 250, 251, 252, 
	253, 254, 256, 257, 258, 260, 261, 262, 
	263, 264, 265, 266, 267, 268, 273, 269, 
	270, 271, 272, 274, 275, 276, 277, 278, 
	281, 282, 283, 285, 286, 284, 282, 283, 
	284, 282, 285, 286, 3, 13, 15, 29, 
	32, 35, 37, 66, 84, 151, 155, 280, 
	281, 288, 64, 290, 292, 293, 294, 295, 
	296, 297, 299, 300, 301, 303, 304, 305, 
	306, 307, 308, 309, 310, 311, 316, 312, 
	313, 314, 315, 317, 318, 319, 320, 321, 
	325, 0
];

const _lexer_trans_actions = [
	43, 0, 54, 3, 1, 0, 29, 1, 
	29, 29, 29, 29, 29, 29, 29, 35, 
	0, 0, 0, 7, 139, 48, 0, 102, 
	9, 5, 45, 134, 45, 0, 33, 122, 
	33, 33, 0, 11, 106, 0, 0, 114, 
	25, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	57, 149, 126, 0, 110, 23, 0, 27, 
	118, 27, 51, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 57, 144, 0, 54, 0, 72, 33, 
	84, 84, 84, 84, 84, 84, 84, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 15, 15, 31, 130, 
	60, 57, 31, 63, 57, 63, 63, 63, 
	63, 63, 63, 63, 66, 0, 0, 0, 
	0, 0, 0, 0, 0, 57, 144, 0, 
	54, 0, 81, 84, 0, 0, 0, 0, 
	0, 0, 21, 0, 0, 0, 0, 0, 
	0, 0, 57, 144, 0, 54, 0, 69, 
	33, 84, 84, 84, 84, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 13, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 13, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	57, 144, 0, 54, 0, 78, 33, 84, 
	84, 84, 84, 84, 84, 84, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 19, 19, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 57, 144, 0, 54, 
	0, 75, 33, 84, 84, 84, 84, 84, 
	84, 84, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 17, 
	17, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 37, 37, 54, 37, 87, 0, 
	0, 39, 0, 0, 93, 90, 41, 96, 
	90, 96, 96, 96, 96, 96, 96, 96, 
	99, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0
];

const _lexer_eof_actions = [
	0, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43, 43, 
	43, 43, 43, 43, 43, 43, 43
];

const lexer_start = 1;
const lexer_first_final = 326;
const lexer_error = 0;

const lexer_en_main = 1;


/* line 129 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

/* line 130 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

/* line 131 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

var Lexer = function(listener) {
  // Check that listener has the required functions
  var events = ['comment', 'tag', 'feature', 'background', 'scenario', 'scenario_outline', 'examples', 'step', 'doc_string', 'row', 'eof'];
  for(e in events) {
    var event = events[e];
    if(typeof listener[event] != 'function') {
      "Error. No " + event + " function exists on " + JSON.stringify(listener);
    }
  }
  this.listener = listener;  
};

Lexer.prototype.scan = function(data) {
  var ending = "\n%_FEATURE_END_%";
  if(typeof data == 'string') {
    data = this.stringToBytes(data + ending);
  } else if(typeof Buffer != 'undefined' && Buffer.isBuffer(data)) {
    // Node.js
    var buf = new Buffer(data.length + ending.length);
    data.copy(buf, 0, 0);
    new Buffer(ending).copy(buf, data.length, 0);
    data = buf;
  }
  var eof = pe = data.length;
  var p = 0;

  this.line_number = 1;
  this.last_newline = 0;

  
/* line 638 "js/lib/gherkin/lexer/en.js" */
{
	  this.cs = lexer_start;
} /* JSCodeGen::writeInit */

/* line 162 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */
  
/* line 645 "js/lib/gherkin/lexer/en.js" */
{
	var _klen, _trans, _keys, _ps, _widec, _acts, _nacts;
	var _goto_level, _resume, _eof_trans, _again, _test_eof;
	var _out;
	_klen = _trans = _keys = _acts = _nacts = null;
	_goto_level = 0;
	_resume = 10;
	_eof_trans = 15;
	_again = 20;
	_test_eof = 30;
	_out = 40;
	while (true) {
	_trigger_goto = false;
	if (_goto_level <= 0) {
	if (p == pe) {
		_goto_level = _test_eof;
		continue;
	}
	if ( this.cs == 0) {
		_goto_level = _out;
		continue;
	}
	}
	if (_goto_level <= _resume) {
	_keys = _lexer_key_offsets[ this.cs];
	_trans = _lexer_index_offsets[ this.cs];
	_klen = _lexer_single_lengths[ this.cs];
	_break_match = false;
	
	do {
	  if (_klen > 0) {
	     _lower = _keys;
	     _upper = _keys + _klen - 1;

	     while (true) {
	        if (_upper < _lower) { break; }
	        _mid = _lower + ( (_upper - _lower) >> 1 );

	        if ( data[p] < _lexer_trans_keys[_mid]) {
	           _upper = _mid - 1;
	        } else if ( data[p] > _lexer_trans_keys[_mid]) {
	           _lower = _mid + 1;
	        } else {
	           _trans += (_mid - _keys);
	           _break_match = true;
	           break;
	        };
	     } /* while */
	     if (_break_match) { break; }
	     _keys += _klen;
	     _trans += _klen;
	  }
	  _klen = _lexer_range_lengths[ this.cs];
	  if (_klen > 0) {
	     _lower = _keys;
	     _upper = _keys + (_klen << 1) - 2;
	     while (true) {
	        if (_upper < _lower) { break; }
	        _mid = _lower + (((_upper-_lower) >> 1) & ~1);
	        if ( data[p] < _lexer_trans_keys[_mid]) {
	          _upper = _mid - 2;
	         } else if ( data[p] > _lexer_trans_keys[_mid+1]) {
	          _lower = _mid + 2;
	        } else {
	          _trans += ((_mid - _keys) >> 1);
	          _break_match = true;
	          break;
	        }
	     } /* while */
	     if (_break_match) { break; }
	     _trans += _klen
	  }
	} while (false);
	_trans = _lexer_indicies[_trans];
	 this.cs = _lexer_trans_targs[_trans];
	if (_lexer_trans_actions[_trans] != 0) {
		_acts = _lexer_trans_actions[_trans];
		_nacts = _lexer_actions[_acts];
		_acts += 1;
		while (_nacts > 0) {
			_nacts -= 1;
			_acts += 1;
			switch (_lexer_actions[_acts - 1]) {
case 0:
/* line 6 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.content_start = p;
    this.current_line = this.line_number;
    this.start_col = p - this.last_newline - (this.keyword+':').length;
  		break;
case 1:
/* line 12 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.current_line = this.line_number;
    this.start_col = p - this.last_newline;
  		break;
case 2:
/* line 17 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.content_start = p;
  		break;
case 3:
/* line 21 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.docstring_content_type_start = p;
  		break;
case 4:
/* line 25 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.docstring_content_type_end = p;
  		break;
case 5:
/* line 29 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    var con = this.unindent(
      this.start_col, 
      this.bytesToString(data.slice(this.content_start, this.next_keyword_start-1)).replace(/(\r?\n)?([\t ])*$/, '').replace(/\\\"\\\"\\\"/mg, '"""')
    );
    var con_type = this.bytesToString(data.slice(this.docstring_content_type_start, this.docstring_content_type_end)).trim();
    this.listener.doc_string(con_type, con, this.current_line); 
  		break;
case 6:
/* line 38 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    p = this.store_keyword_content('feature', data, p, eof);
  		break;
case 7:
/* line 42 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    p = this.store_keyword_content('background', data, p, eof);
  		break;
case 8:
/* line 46 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    p = this.store_keyword_content('scenario', data, p, eof);
  		break;
case 9:
/* line 50 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    p = this.store_keyword_content('scenario_outline', data, p, eof);
  		break;
case 10:
/* line 54 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    p = this.store_keyword_content('examples', data, p, eof);
  		break;
case 11:
/* line 58 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    var con = this.bytesToString(data.slice(this.content_start, p)).trim();
    this.listener.step(this.keyword, con, this.current_line);
  		break;
case 12:
/* line 63 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    var con = this.bytesToString(data.slice(this.content_start, p)).trim();
    this.listener.comment(con, this.line_number);
    this.keyword_start = null;
  		break;
case 13:
/* line 69 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    var con = this.bytesToString(data.slice(this.content_start, p)).trim();
    this.listener.tag(con, this.line_number);
    this.keyword_start = null;
  		break;
case 14:
/* line 75 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.line_number++;
  		break;
case 15:
/* line 79 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.last_newline = p + 1;
  		break;
case 16:
/* line 83 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.keyword_start = this.keyword_start || p;
  		break;
case 17:
/* line 87 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.keyword = this.bytesToString(data.slice(this.keyword_start, p)).replace(/:$/, '');
    this.keyword_start = null;
  		break;
case 18:
/* line 92 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.next_keyword_start = p;
  		break;
case 19:
/* line 96 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    p = p - 1;
    current_row = [];
    this.current_line = this.line_number;
  		break;
case 20:
/* line 102 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.content_start = p;
  		break;
case 21:
/* line 106 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    var con = this.bytesToString(data.slice(this.content_start, p)).trim();
    current_row.push(con.replace(/\\\|/, "|").replace(/\\n/, "\n").replace(/\\\\/, "\\"));
  		break;
case 22:
/* line 111 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    this.listener.row(current_row, this.current_line);
  		break;
case 23:
/* line 115 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    if(this.cs < lexer_first_final) {
      var content = this.current_line_content(data, p);
      throw "Lexing error on line " + this.line_number + ": '" + content + "'. See http://wiki.github.com/cucumber/gherkin/lexingerror for more information.";
    } else {
      this.listener.eof();
    }
    
  		break;
/* line 872 "js/lib/gherkin/lexer/en.js" */
			} /* action switch */
		}
	}
	if (_trigger_goto) {
		continue;
	}
	}
	if (_goto_level <= _again) {
	if ( this.cs == 0) {
		_goto_level = _out;
		continue;
	}
	p += 1;
	if (p != pe) {
		_goto_level = _resume;
		continue;
	}
	}
	if (_goto_level <= _test_eof) {
	if (p == eof) {
	__acts = _lexer_eof_actions[ this.cs];
	__nacts =  _lexer_actions[__acts];
	__acts += 1;
	while (__nacts > 0) {
		__nacts -= 1;
		__acts += 1;
		switch (_lexer_actions[__acts - 1]) {
case 23:
/* line 115 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */

    if(this.cs < lexer_first_final) {
      var content = this.current_line_content(data, p);
      throw "Lexing error on line " + this.line_number + ": '" + content + "'. See http://wiki.github.com/cucumber/gherkin/lexingerror for more information.";
    } else {
      this.listener.eof();
    }
    
  		break;
/* line 911 "js/lib/gherkin/lexer/en.js" */
		} /* eof action switch */
	}
	if (_trigger_goto) {
		continue;
	}
}
	}
	if (_goto_level <= _out) {
		break;
	}
	}
	}

/* line 163 "/Users/ahellesoy/scm/gherkin/tasks/../ragel/i18n/en.js.rl" */
};

Lexer.prototype.bytesToString = function(bytes) {
  if(typeof bytes.write == 'function') {
    // Node.js
    return bytes.toString('utf-8');
  } else {
    var result = "";
    for(var b in bytes) {
      result += String.fromCharCode(bytes[b]);
    }
    return result;
  }
};

Lexer.prototype.stringToBytes = function(string) {
  var bytes = [];
  for(var i = 0; i < string.length; i++) {
    bytes[i] = string.charCodeAt(i);
  }
  return bytes;
};

Lexer.prototype.unindent = function(startcol, text) {
  startcol = startcol || 0;
  return text.replace(new RegExp('^[\t ]{0,' + startcol + '}', 'gm'), ''); 
};

Lexer.prototype.store_keyword_content = function(event, data, p, eof) {
  var end_point = (!this.next_keyword_start || (p == eof)) ? p : this.next_keyword_start;
  var content = this.unindent(this.start_col + 2, this.bytesToString(data.slice(this.content_start, end_point))).replace(/\s+$/,"");
  var content_lines = content.split("\n")
  var name = content_lines.shift() || "";
  name = name.trim();
  var description = content_lines.join("\n");
  this.listener[event](this.keyword, name, description, this.current_line);
  var nks = this.next_keyword_start;
  this.next_keyword_start = null;
  return nks ? nks - 1 : p;
};

Lexer.prototype.current_line_content = function(data, p) {
  var rest = data.slice(this.last_newline, -1);
  var end = rest.indexOf(10) || -1;
  return this.bytesToString(rest.slice(0, end)).trim();
};

// Node.js export
if(typeof exports !== 'undefined') {
  exports.Lexer = Lexer;
}
// Require.js export
if (typeof define !== 'undefined') {
  if(define.amd) {
    define('gherkin/lexer/en', [], function() {
      return Lexer
    });
  } else {
    define('gherkin/lexer/en', function(require, exports, module) {
      exports.Lexer = Lexer;
    });
  }
}

})();

});

require.alias("gherkin/lib/gherkin/lexer/en", "./gherkin/lexer/en");
