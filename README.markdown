<a name="README">[Riurik acceptance testing framework for web applications](https://github.com/andrew-malkov/Riurik)</a>
=======
Riurik is a wiki web server that allows to make, organize, and run selenium free, pure javascript acceptance test scripts. It aims to simplify the process of UI, functional and integration testing web applications. A web browser - the only thing that you need for this. Riurik is written in Javascript and Python using jQuery, Qunit, Django, heavily influenced by, and borrows the best parts of Fitnesse.

Documentation:
--------------

### Usage Requirements

* [Python 2][2]
* [Django] [3]
* [jQuery][1]
 
### Quick start

Being a Django web application, Riurik requires Python and Django. It works with Python version 2.6 and 2.7. Get Python at [http://www.python.org][6]. If you’re running Linux, you probably already have it installed. To install the Django framework follow [this installation guid][5]. Now download and unpack the [latest Riurik packaged release from Github][4]. In the src folder execute

        sh run.sh

for Linux. For Windows use

        run.bat

but first you have to [add the python path to Windows PATH][AddingPythonToWindowsPath] or just modify the run.bat script by adding full path to python.exe command.

Start up a web browser and go to http://localhost:8000. The main Riurik screen should come up.

To make you django application ready to work with Riurik download [Riurik Django bindings][DjangoBindings]. Unpack it into your django web application tests folder. It should be a package directory, i.e. contain \_\_init\_\_.py. Also create your test suites folder there. For example

       django web app
       | tests
       | | cases
       | | riurik
       | | __init__.py
       
In your urls.py add urlpatterns to include('tests.riurik.urls')

    urlpatterns += patterns('',
      (r'^testsrc', include('tests.riurik.urls')),
    )
       
That's it. You're ready to start using Riurik.

### Example

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

Authors
------
Riurik is written by

* [Andrew Malkov][amalkov]
* [Anton Timiskov][atimiskov]

Credit
------

Credit of course goes to:

[jQuery][0]: jQuery Copyright ©2010 by The jQuery Project

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
[2]: http://python.org/ "Python 2"
[3]: https://www.djangoproject.com "Django"
[4]: https://github.com/andrew-malkov/Riurik/downloads "Riurik Download"
[5]: https://docs.djangoproject.com/en/1.3/topics/install
[6]: http://www.python.org
[DjangoBindings]: https://github.com/andrew-malkov/Riurik-Django/downloads
[amalkov]: https://github.com/andrew-malkov
[atimiskov]: https://github.com/AntonTimiskov
[AddingPythonToWindowsPath]: http://code.google.com/p/tryton/wiki/AddingPythonToWindowsPath