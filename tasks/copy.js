/*
 * grunt-contrib-copy
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Chris Talkington, contributors
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt-contrib-copy/blob/master/LICENSE-MIT
 */

module.exports = function(grunt) {
  'use strict';
  var path = require('path');
  var fs = require('fs');

  grunt.registerMultiTask('copy', 'Copy files.', function() {
    var kindOf = grunt.util.kindOf;
    var helpers = require('grunt-lib-contrib').init(grunt);

    var options = helpers.options(this, {
      processContent: false,
      processContentExclude: []
    });

    var copyOptions = {
      process: options.processContent,
      noProcess: options.processContentExclude
    };

    grunt.verbose.writeflags(options, 'Options');

    var dest;
    var isExpandedPair;

    this.files.forEach(function(filePair) {
      isExpandedPair = filePair.orig.expand || false;

      filePair.src.forEach(function(src) {

        if (detectDestType(filePair.dest) === 'directory') {
          dest = (isExpandedPair) ? filePair.dest : unixifyPath(path.join(filePair.dest, src));
        } else {
          dest = filePair.dest;
        }
        // new stuff.
        if(filePair.onlyNewer){
          var srcFile, destFile;
          try{
            srcFile = fs.statSync(src);
            destFile = fs.statSync(dest);
          }
          catch(err){
            // no dest file.
            srcFile = false;
            destFile = false;
          }
          if(srcFile && destFile){
            if(!grunt.file.isDir(src) && (srcFile.size !== destFile.size /*|| srcFile.mtime > destFile.ctime*/ )){
                grunt.log.writeln('Copying ' + src.cyan + ' -> ' + dest.cyan);
                grunt.file.copy(src, dest, copyOptions);
            }
          }
          else {
            createNew(grunt,src,dest,copyOptions);
          }
        }
        else {
          createNew(grunt,src,dest,copyOptions);
        }
      });
    });
  });
  var createNew = function(grunt,src,dest,copyOptions){
    if (grunt.file.isDir(src)) {
      grunt.log.writeln('Creating ' + dest.cyan);
      grunt.file.mkdir(dest);
    } else {
      grunt.log.writeln('Copying ' + src.cyan + ' -> ' + dest.cyan);
      grunt.file.copy(src, dest, copyOptions);
    }
  };

  var detectDestType = function(dest) {
    if (grunt.util._.endsWith(dest, '/')) {
      return 'directory';
    } else {
      return 'file';
    }
  };

  var unixifyPath = function(filepath) {
    if (process.platform === 'win32') {
      return filepath.replace(/\\/g, '/');
    } else {
      return filepath;
    }
  };
};
