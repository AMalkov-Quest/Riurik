from github import Github

git = Github('riurik', 'riurik')
user = git.get_user()
keys = user.get_keys()
for key in keys:
	print key.title
	print key.id
	print key.key
