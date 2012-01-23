import xml.etree.cElementTree as ET
import json

"""
https://github.com/hay/xml2json/blob/master/xml2json
"""

def json_to_elem(jsonobj):
	'''
	>>> o = '{"tag1": "1", "tag2": "2"}'
	>>> json_to_elem(json.loads(o))
	>>> o = '{"testsuite": { "@name": "export", "#text": "empty"} }'
	>>> json_to_elem(json.loads(o))
	>>> o = '{"testsuite": { "@name": "module", "#tail": "testcase" } }'
	>>> json_to_elem(json.loads(o))
	>>> o = '{"testsuite": { "@name": "module", "testcase": {"@name": "test"} } }'
	>>> json_to_elem(json.loads(o))
	'''
	attrs = {}
	text = ''
	subels = []
	for key in jsonobj.keys():
		value = jsonobj[key]
		if isinstance(value, dict):
			for k, v in value.items():
				if k[:1] == "@":
					attrs[k[1:]] = v
				elif k == "#text":
					text = v
				elif isinstance(value, dict):
					tail = v
		else:
			text = value

		e = ET.Element(key, attrs)
		e.text = text
		e.tail = tail
		print ET.tostring(e)
