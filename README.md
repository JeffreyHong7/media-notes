Steps to Access Website

1. Download git and NodeJS if they aren't already installed on your device.
2. On your local command line interface, run "git clone https://github.com/JeffreyHong7/media-notes <name>" to create a local copy of the remote repository where <name> is what you want to call the local copy.
3. Run "cd <name>" to enter the cloned repository
4. Run "npm i" (and "npm audit fix")
5. Run "node --watch index.js"
6. On your web browser, enter the following: localhost:3000
7. When creating a new review, the IMDb ID of a media can be found in the URL link of the IMDb page corresponding to the media that you want to write a review to. Following, https://www.imdb.com/title/ there should be an ID starting with 2 letters and at least 7 numbers.
