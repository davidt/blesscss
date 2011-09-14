# blesscss

blesscss is a very simple web service to compile [LessCSS](http://lesscss.org)
files into CSS. It exposes two URLs, at `/` and `/min/`, for normal and
minimized output, respectively. On success, the result will be a 200 success
code and the compiled output. On failure, this service will return 400 and an
error string.

## Usage

To run locally, simply use npm to install the `express`, `formidable` and
`less` packages. Then start your server:

    node main.js
    curl -F "main.less=<main.less" -F "included.less=<included.less" http://localhost:3000/

I've also staged this application on Cloud Foundry, so you can just use it:

    curl -F "main.less=<main.less" http://blesscss.cloudfoundry.com/min -o compiled-min.css

Curl is a little finicky about how it reports errors. You can either get the
contents of the page (a-la the commands listed above) and see if it has your
CSS, or you can add `--fail` to the command-line, and it will give you a
non-zero return code (and no output). As far as I can tell, there's no way
to get both the text of the output and have curl return non-zero.