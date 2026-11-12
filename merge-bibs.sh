#!/bin/bash

# collects all of the .bib files (except the sample one) and merges them
#
# tidy the outcome with:
#     https://flamingtempura.github.io/bibtex-tidy/index.html
#
# probably it would be better to just have a course Zotero

find . -type f -name \*.bib >bibs.txt 

SAVEIFS=$IFS
IFS=$(echo -en "\n\b")
for f in `cat bibs.txt`; do
  # echo "$f"
  cat "$f" >> allbibs.txt
done
IFS=$SAVEIFS
