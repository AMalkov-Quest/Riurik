import settings
import cucumber

def engage4test(path, fullpath, ctx):
	engine = 'qunit'
	if is_cucumber(path, ctx):
		engine = 'cucumber'
		if path.endswith(settings.CUCUMBER_FILE_EXT):
			path = cucumber.compile2js(path, fullpath)

	if is_mocha(ctx):
		engine = 'mocha'

	if is_jasmine(ctx):
		engine = 'jasmine'
	
	if is_daspec(path, ctx):
		engine = 'daspec'

	return engine

def engage4suite(path, fullpath, ctx):
	engine = 'qunit'
	if is_cucumber(path, ctx):
		engine = 'cucumber'
		cucumber.compileSuite(path, fullpath)
		
	if is_mocha(ctx):
		engine = 'mocha'

	if is_jasmine(ctx):
		engine = 'jasmine'

	if is_daspec(path, ctx):
		engine = 'daspec'

	return engine

def is_daspec(path, ctx):
	return path.endswith(settings.DASPEC_FILE_EXT) or ctx.get('daspec', None) != None

def is_cucumber(path, ctx):
	return path.endswith(settings.CUCUMBER_FILE_EXT) or ctx.get('cucumber', None) != None

def is_mocha(ctx):
	return ctx.get('mocha', None) != None

def is_jasmine(ctx):
	return ctx.get('jasmine', None) != None
