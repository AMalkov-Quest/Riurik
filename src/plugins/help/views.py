from django.http import HttpResponse
import codecs
import os.path
import markdown
import settings

def readme(request):
	doc_name = request.REQUEST.get('doc', 'README.markdown')	
	path = os.path.join(settings.root, doc_name)
	html = markdown2html(path) 
	return HttpResponse(html)

def markdown2html(path):
	text = markdown2text(path)
	md = markdown.Markdown()
	return md.convert(text)

def markdown2text(path):
	f = codecs.open(path, mode="r", encoding="utf-8")
	text = f.read()
	f.close()
	return text
