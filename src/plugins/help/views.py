from django.http import HttpResponse
import codecs
import os.path
import markdown
import settings

def __readme(request):
	#readme_path = os.path.join(settings.root, 'README.markdown')
	readme_path = os.path.join(os.path.dirname( __file__ ), 'README.markdown')
	html = markdown.markdownFromFile(readme_path)
	return HttpResponse(html)

def readme(request):
	md = markdown.Markdown()
	readme_path = os.path.join(settings.root, 'README.markdown')
	ifile = codecs.open(readme_path, mode="r", encoding="utf-8")
	text = ifile.read()
	ifile.close()
	html = md.convert(text)
	return HttpResponse(html)


