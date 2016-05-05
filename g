#!/usr/bin/env bash

hexo g
gulp
cp -r -f dst/* public
rm -rf dst/
