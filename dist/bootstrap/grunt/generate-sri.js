#!/usr/bin/env node
/*! For license information please see generate-sri.js.LICENSE.txt */
"use strict";var crypto=require("crypto"),fs=require("fs"),path=require("path"),replace=require("replace-in-file"),configFile=path.join(__dirname,"../_config.yml"),files=[{file:"dist/css/bootstrap.min.css",configPropertyName:"css_hash"},{file:"dist/css/bootstrap-theme.min.css",configPropertyName:"css_theme_hash"},{file:"dist/js/bootstrap.min.js",configPropertyName:"js_hash"}];files.forEach((function(e){fs.readFile(e.file,"utf8",(function(r,s){if(r)throw r;var i="sha384",o=i+"-"+crypto.createHash(i).update(s,"utf8").digest("base64");console.log(e.configPropertyName+": "+o);try{replace.sync({files:configFile,from:new RegExp("(\\s"+e.configPropertyName+":\\s+\"|')(\\S+)(\"|')"),to:"$1"+o+"$3"})}catch(e){console.error("Error occurred:",e)}}))}));