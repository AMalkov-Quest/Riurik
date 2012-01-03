<a name="README">[Riurik](https://github.com/andrew-malkov/Riurik)</a> - acceptance testing framework for web applications
=======
Riurik is a wiki web server that allows to make, organize, and run test scripts. Riurik aims to simplify the process of integration testing web applications. It's written in Javascript and Python using jQuery, Qunit, Django, heavily influenced by, and borrows the best parts of Fitnesse.

Using Riurik you can create pure javascript, selenium free acceptence tests for you web application. A web browser - the only thing that you need to do this.

### Example!

module('demo');

    asyncTest('create suite button', function() {
      $.when(frame.go('riurik-inner-tests')).then(function() {
        equal(_$('#new-suite').text(), 'Create Suite');
        _$('#new-suite').click();
        equal(_$('.ui-dialog-title').text(), 'Create Suite');
        equal(_$('#fsobject-tip').text(), 'Specify a suite name here');
        equal(_$('#create-folder-btn').text(), 'create');
        
        _$('#object-name').val('second-suite');
        _$('#create-folder-btn').click();
        
        $.when(frame.load()).then(function() {
          ok(_$('li#second-suite.folder').length > 0, 'new suite is created successfully');
          
          start();
        });
      });
    });

Credit
------

Credit of course goes to:

[QUnit][1]: Copyright (c) 2008 John Resig, Jörn Zaefferer, used under the terms of the MIT LICENSE

Changelog
---------

* 0.1 - Initial Release

License
-------

Copyright (c) 2011-2012 Andrew Malkov, http://amalkov.blogspot.com

The MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[0]: http://jquery.com "jQuery"
[1]: http://docs.jquery.com/QUnit "QUnit"