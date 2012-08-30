udo apt-get install -y python-pip
sudo pip install Django

scp -i .ssh/amalkov.pem .ssh/id_rsa ubuntu@ec2-107-20-122-27.compute-1.amazonaws.com:.ssh/id_rsa
scp -i .ssh/amalkov.pem .ssh/id_rsa.pub ubuntu@ec2-107-20-122-27.compute-1.amazonaws.com:.ssh/id_rsa.pub

chmod 400 id_rsa
chmod 400 id_rsa.pub
