#!/bin/sh

pid=`ps aux | grep node-chat | grep -v grep | grep -m1 -Eo '[0-9]+' | head -1`

if [ -n "$pid" ]; then
   exit
fi

kill -9 $pid
