.PHONY: init build start
.SILENT:


init:
	echo "Moving to client/...";
	cd client;
	echo "running npm install...";
	npm install;
	echo "Returning to main dir in client dir...";
	cd ../;
	echo "running npm install in main dir...";
	npm install;
	echo "All necessary packages installed.";

build:
	cd client;
	npm run build;
	echo "Bad boy is build! make a run for it! I'm going back...";
	cd ../;

